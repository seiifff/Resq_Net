// ResQNet — Incident routes (Sprint 1: reporting + live map data)
const express = require("express");
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const db = require("../db/database");
const { districtFor } = require("./districts");

const router = express.Router();

const TYPES = ["flood", "fire", "accident", "medical"];
const RESOURCES = ["water", "medical", "evacuation", "food"];

// Parse a free-text needs list into a clean [{item, qty}] array.
// Accepts JSON from the form; caps items and lengths so it can't be abused.
function parseNeeds(raw) {
  if (!raw) return null;
  let arr;
  try { arr = typeof raw === "string" ? JSON.parse(raw) : raw; } catch { return null; }
  if (!Array.isArray(arr)) return null;
  const clean = arr
    .map((n) => ({
      item: String(n.item || "").trim().slice(0, 40),
      qty: String(n.qty || "").trim().slice(0, 20),
    }))
    .filter((n) => n.item.length > 0)
    .slice(0, 10);
  return clean.length ? JSON.stringify(clean) : null;
}

// ---- Photo upload: disk storage with safe random filenames ----
const storage = multer.diskStorage({
  destination: path.join(__dirname, "..", "uploads"),
  filename: (req, file, cb) => {
    const ext = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp" }[file.mimetype];
    cb(null, crypto.randomBytes(10).toString("hex") + ext);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) =>
    cb(null, ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)),
});

// ---- Simple severity auto-scoring (type base + keyword boost) ----
function scoreSeverity(type, description) {
  let s = { medical: 2, fire: 2, flood: 1, accident: 1 }[type] || 1;
  const hot = /trapped|drowning|children|child|injured|bleeding|unconscious|collapsed|spreading|rising fast/i;
  if (hot.test(description || "")) s += 1;
  return Math.min(s, 3);
}

const requireLogin = (req, res, next) =>
  req.session.user ? next() : res.status(401).json({ ok: false, errors: ["Sign in first."] });

// ---------------------------------------------------------------- CREATE --
router.post("/incidents", requireLogin, upload.single("photo"), (req, res) => {
  const { type, description = "", lat, lng, resource, needs } = req.body || {};
  const errors = [];

  if (!TYPES.includes(type)) errors.push("Choose an emergency type.");
  const la = parseFloat(lat), ln = parseFloat(lng);
  if (!Number.isFinite(la) || la < -90 || la > 90 || !Number.isFinite(ln) || ln < -180 || ln > 180)
    errors.push("Location is missing — allow location access and try again.");
  if (description.length > 500) errors.push("Description must be under 500 characters.");
  const resVal = RESOURCES.includes(resource) ? resource : null;
  const needsVal = parseNeeds(needs);

  if (errors.length) return res.status(400).json({ ok: false, errors });

  const info = db.prepare(
    `INSERT INTO incidents (citizen_id, type, description, lat, lng, resource, needs, photo, severity, district)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    req.session.user.id, type, description.trim(), la, ln,
    resVal, needsVal, req.file ? req.file.filename : null,
    scoreSeverity(type, description), districtFor(la, ln)
  );

  res.json({ ok: true, id: info.lastInsertRowid, redirect: "/map" });
});

// ------------------------------------------------------ QUICK REPORT --
// No login required. Added after tutor feedback: in an emergency a citizen
// should not have to create an account before reporting. A quick report is
// attached to the system "Guest Reporter" account, flagged is_guest, with an
// optional phone number so responders can call back. Guest reports cannot earn
// or lose a Trust Score (there is no real account behind them), so they show on
// the map and reach volunteers but are clearly marked as unverified guest reports.
router.post("/quick-report", upload.single("photo"), (req, res) => {
  const { type, description = "", lat, lng, resource, phone = "", needs } = req.body || {};
  const errors = [];

  if (!TYPES.includes(type)) errors.push("Choose an emergency type.");
  const la = parseFloat(lat), ln = parseFloat(lng);
  if (!Number.isFinite(la) || la < -90 || la > 90 || !Number.isFinite(ln) || ln < -180 || ln > 180)
    errors.push("Location is missing — allow location access and try again.");
  if (description.length > 500) errors.push("Description must be under 500 characters.");
  const phoneClean = String(phone).trim().slice(0, 20);
  if (phoneClean && !/^[0-9+\-\s()]{6,20}$/.test(phoneClean))
    errors.push("Enter a valid phone number, or leave it blank.");
  const resVal = RESOURCES.includes(resource) ? resource : null;
  if (errors.length) return res.status(400).json({ ok: false, errors });

  const guest = db.prepare("SELECT id FROM users WHERE email = 'guest@resqnet.lk'").get();
  if (!guest) return res.status(500).json({ ok: false, errors: ["Guest reporting is unavailable right now."] });

  const info = db.prepare(
    `INSERT INTO incidents (citizen_id, type, description, lat, lng, resource, needs, photo, severity, district, is_guest, guest_phone)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`
  ).run(
    guest.id, type, description.trim(), la, ln,
    resVal, parseNeeds(needs), req.file ? req.file.filename : null,
    scoreSeverity(type, description), districtFor(la, ln),
    phoneClean || null
  );
  res.json({ ok: true, id: info.lastInsertRowid, redirect: "/track/" + info.lastInsertRowid });
});

// Public status tracker for a guest report (no login) — lets a citizen who
// reported without an account still see whether help is on the way.
router.get("/quick-status/:id(\\d+)", (req, res) => {
  const i = db.prepare(
    `SELECT id, type, status, severity, escalated, district, created_at, is_guest
     FROM incidents WHERE id = ? AND is_guest = 1`
  ).get(req.params.id);
  if (!i) return res.status(404).json({ ok: false, errors: ["Report not found."] });
  res.json({ ok: true, incident: i });
});

// -------------------------------------------------------------- SOS --
// One tap: no form, no type choice. Maximum severity, escalated immediately.
// The only required input is location — everything else is deliberately skipped
// because a person pressing SOS may not have time to fill anything in.
router.post("/sos", requireLogin, (req, res) => {
  const la = parseFloat(req.body?.lat), ln = parseFloat(req.body?.lng);
  if (!Number.isFinite(la) || la < -90 || la > 90 || !Number.isFinite(ln) || ln < -180 || ln > 180)
    return res.status(400).json({ ok: false, errors: ["Location is required for SOS — allow location access."] });

  // Don't spam: reuse an existing unresolved SOS from this citizen
  const open = db.prepare(
    "SELECT id FROM incidents WHERE citizen_id = ? AND sos = 1 AND status != 'resolved'"
  ).get(req.session.user.id);
  if (open) return res.json({ ok: true, id: open.id, existing: true, redirect: "/incident/" + open.id });

  const info = db.prepare(
    `INSERT INTO incidents (citizen_id, type, description, lat, lng, severity, district, sos, escalated)
     VALUES (?, 'medical', 'SOS — emergency assistance requested', ?, ?, 3, ?, 1, 1)`
  ).run(req.session.user.id, la, ln, districtFor(la, ln));

  res.json({ ok: true, id: info.lastInsertRowid, redirect: "/incident/" + info.lastInsertRowid });
});

// ------------------------------------------------------- LIST (live map) --
router.get("/incidents", requireLogin, (req, res) => {
  sweep();
  const rows = db.prepare(
    `SELECT i.id, i.type, i.description, i.lat, i.lng, i.resource, i.photo,
            i.severity, i.status, i.created_at, i.escalated, i.district, i.sos, i.is_guest,
            u.full_name AS reporter, r.full_name AS responder
     FROM incidents i JOIN users u ON u.id = i.citizen_id
     LEFT JOIN users r ON r.id = i.responder_id
     ORDER BY i.created_at DESC LIMIT 200`
  ).all();
  res.json({ ok: true, incidents: rows });
});

// ------------------------------------------------------------- MY REPORTS --
router.get("/incidents/mine", requireLogin, (req, res) => {
  sweep();
  const rows = db.prepare(
    `SELECT id, type, description, resource, severity, status, created_at
     FROM incidents WHERE citizen_id = ? ORDER BY created_at DESC LIMIT 50`
  ).all(req.session.user.id);
  res.json({ ok: true, incidents: rows });
});

module.exports = router;

/* ============================================================
   SPRINT 2 — Volunteer response system
   ============================================================ */

// Which volunteer skills match which emergency types
const SKILL_MATCH = {
  flood:    ["Flood Response", "Search & Rescue"],
  fire:     ["Fire Safety", "Search & Rescue"],
  accident: ["Medical / First Aid", "Search & Rescue"],
  medical:  ["Medical / First Aid"],
};
// Logistics volunteers match anything with a resource request;
// Communications volunteers match anything escalated.

// ---- Escalation sweep (runs lazily on reads — no cron needed) ----
// Rule 1: active >10 min with no responder → severity bump + escalated flag
// Rule 2: responding but no check-in for 15 min → released back to active (escalated)
function sweep() {
  db.prepare(
    `UPDATE incidents SET escalated = 1, severity = MIN(severity + 1, 3)
     WHERE status = 'active' AND escalated = 0
       AND created_at <= datetime('now', '-10 minutes')`
  ).run();
  // Rule 3 (cluster): 3+ active reports in the same ~5 km grid cell within 30 min
  // → the whole cluster becomes severity 3 + escalated (high-priority alert)
  db.prepare(
    `UPDATE incidents SET severity = 3, escalated = 1
     WHERE status = 'active' AND id IN (
       SELECT i.id FROM incidents i JOIN (
         SELECT ROUND(lat*20)/20 AS glat, ROUND(lng*20)/20 AS glng, COUNT(*) AS c
         FROM incidents
         WHERE status = 'active' AND created_at >= datetime('now','-30 minutes')
         GROUP BY glat, glng HAVING c >= 3
       ) g ON ROUND(i.lat*20)/20 = g.glat AND ROUND(i.lng*20)/20 = g.glng
       WHERE i.status = 'active' AND i.created_at >= datetime('now','-30 minutes')
     )`
  ).run();
  db.prepare(
    `UPDATE incidents SET status = 'active', responder_id = NULL,
            responded_at = NULL, last_checkin = NULL, escalated = 1
     WHERE status = 'responding'
       AND COALESCE(last_checkin, responded_at) <= datetime('now', '-15 minutes')`
  ).run();
}
const isVolunteer = (req) => ["volunteer", "admin"].includes(req.session.user.role);

// ------------------------------------------- MATCHED ALERTS (volunteer) --
router.get("/alerts", requireLogin, (req, res) => {
  sweep();
  if (!isVolunteer(req)) return res.status(403).json({ ok: false, errors: ["Volunteers only."] });

  const me = db.prepare("SELECT skills FROM users WHERE id = ?").get(req.session.user.id);
  const skills = JSON.parse(me?.skills || "[]");

  const active = db.prepare(
    `SELECT i.*, u.full_name AS reporter FROM incidents i
     JOIN users u ON u.id = i.citizen_id
     WHERE i.status = 'active' ORDER BY i.sos DESC, i.severity DESC, i.created_at DESC`
  ).all();

  const matched = [], other = [];
  for (const i of active) {
    const wanted = SKILL_MATCH[i.type] || [];
    const hit =
      i.sos ||  // an SOS reaches every volunteer regardless of skill
      wanted.some((s) => skills.includes(s)) ||
      (skills.includes("Logistics & Transport") && i.resource) ||
      (skills.includes("Communications") && i.escalated) ||
      req.session.user.role === "admin";
    (hit ? matched : other).push(i);
  }

  const mine = db.prepare(
    `SELECT i.*, u.full_name AS reporter FROM incidents i
     JOIN users u ON u.id = i.citizen_id
     WHERE i.responder_id = ? AND i.status = 'responding'`
  ).get(req.session.user.id) || null;

  res.json({ ok: true, matched, other, active_response: mine, skills });
});

// ------------------------------------------------------------- RESPOND --
router.post("/incidents/:id/respond", requireLogin, (req, res) => {
  if (!isVolunteer(req)) return res.status(403).json({ ok: false, errors: ["Volunteers only."] });
  const busy = db.prepare(
    "SELECT id FROM incidents WHERE responder_id = ? AND status = 'responding'"
  ).get(req.session.user.id);
  if (busy) return res.status(409).json({ ok: false, errors: ["You're already responding to an incident. Resolve it first."] });

  const r = db.prepare(
    `UPDATE incidents SET status = 'responding', responder_id = ?,
            responded_at = datetime('now'), last_checkin = datetime('now')
     WHERE id = ? AND status = 'active'`
  ).run(req.session.user.id, req.params.id);
  if (!r.changes) return res.status(409).json({ ok: false, errors: ["Someone is already responding to this incident."] });
  res.json({ ok: true });
});

// ------------------------------------------------------------- CHECK-IN --
router.post("/incidents/:id/checkin", requireLogin, (req, res) => {
  const r = db.prepare(
    `UPDATE incidents SET last_checkin = datetime('now')
     WHERE id = ? AND responder_id = ? AND status = 'responding'`
  ).run(req.params.id, req.session.user.id);
  if (!r.changes) return res.status(409).json({ ok: false, errors: ["You're not the active responder here."] });
  res.json({ ok: true });
});

// --------------------------------------------- RESOLVE + TRUST SCORE --
router.post("/incidents/:id/resolve", requireLogin, (req, res) => {
  const genuine = req.body?.genuine !== false; // default: genuine
  const inc = db.prepare("SELECT * FROM incidents WHERE id = ?").get(req.params.id);
  if (!inc) return res.status(404).json({ ok: false, errors: ["Incident not found."] });

  const allowed = req.session.user.role === "admin" ||
    (inc.responder_id === req.session.user.id && inc.status === "responding");
  if (!allowed) return res.status(403).json({ ok: false, errors: ["Only the active responder or an admin can resolve this."] });

  db.prepare(
    `UPDATE incidents SET status = 'resolved', resolved_at = datetime('now'), false_report = ?
     WHERE id = ?`
  ).run(genuine ? 0 : 1, inc.id);

  // Community Trust Score: +10 verified · −25 false (bounded 0–200)
  db.prepare(
    `UPDATE users SET trust_score = MAX(0, MIN(200, trust_score + ?)) WHERE id = ?`
  ).run(genuine ? 10 : -25, inc.citizen_id);

  res.json({ ok: true });
});

// ------------------------------------------------------------- DETAIL --
router.get("/incidents/:id(\\d+)", requireLogin, (req, res) => {
  sweep();
  const i = db.prepare(
    `SELECT i.*, u.full_name AS reporter, u.trust_score AS reporter_trust,
            r.full_name AS responder
     FROM incidents i
     JOIN users u ON u.id = i.citizen_id
     LEFT JOIN users r ON r.id = i.responder_id
     WHERE i.id = ?`
  ).get(req.params.id);
  if (!i) return res.status(404).json({ ok: false, errors: ["Incident not found."] });
  const me = req.session.user;
  res.json({
    ok: true, incident: i,
    viewer: {
      id: me.id, role: me.role,
      is_reporter: i.citizen_id === me.id,
      is_responder: i.responder_id === me.id,
      can_chat: i.citizen_id === me.id || i.responder_id === me.id || me.role === "admin",
    },
  });
});

// ------------------------------------------------------------ MESSAGES --
function canChat(inc, user) {
  return inc && (inc.citizen_id === user.id || inc.responder_id === user.id || user.role === "admin");
}
router.get("/incidents/:id/messages", requireLogin, (req, res) => {
  const inc = db.prepare("SELECT * FROM incidents WHERE id = ?").get(req.params.id);
  if (!canChat(inc, req.session.user)) return res.status(403).json({ ok: false, errors: ["Not part of this incident."] });
  const rows = db.prepare(
    `SELECT m.id, m.body, m.created_at, m.sender_id, u.full_name AS sender, u.role AS sender_role
     FROM messages m JOIN users u ON u.id = m.sender_id
     WHERE m.incident_id = ? ORDER BY m.created_at ASC LIMIT 200`
  ).all(req.params.id);
  res.json({ ok: true, messages: rows });
});
router.post("/incidents/:id/messages", requireLogin, (req, res) => {
  const inc = db.prepare("SELECT * FROM incidents WHERE id = ?").get(req.params.id);
  if (!canChat(inc, req.session.user)) return res.status(403).json({ ok: false, errors: ["Not part of this incident."] });
  const body = (req.body?.body || "").trim();
  if (!body || body.length > 500) return res.status(400).json({ ok: false, errors: ["Message must be 1–500 characters."] });
  db.prepare("INSERT INTO messages (incident_id, sender_id, body) VALUES (?, ?, ?)")
    .run(req.params.id, req.session.user.id, body);
  res.json({ ok: true });
});

// ---------------------------------------------------- RESPONSE HISTORY --
router.get("/responses/mine", requireLogin, (req, res) => {
  const rows = db.prepare(
    `SELECT id, type, status, severity, false_report, resolved_at, created_at
     FROM incidents WHERE responder_id = ? ORDER BY created_at DESC LIMIT 50`
  ).all(req.session.user.id);
  res.json({ ok: true, responses: rows });
});
