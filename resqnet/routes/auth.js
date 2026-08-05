// ResQNet — Authentication routes (Sprint 1)
const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../db/database");

const router = express.Router();

const DISTRICTS = ["Ampara","Anuradhapura","Badulla","Batticaloa","Colombo","Galle","Gampaha","Hambantota","Jaffna","Kalutara","Kandy","Kegalle","Kilinochchi","Kurunegala","Mannar","Matale","Matara","Monaragala","Mullaitivu","Nuwara Eliya","Polonnaruwa","Puttalam","Ratnapura","Trincomalee","Vavuniya"];
const SKILLS = ["Medical / First Aid","Search & Rescue","Fire Safety","Flood Response","Logistics & Transport","Communications"];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^0\d{9}$/; // Sri Lankan format: 0XXXXXXXXX

// ---- Simple in-memory login throttle: 5 failed attempts → 10 min lockout ----
const attempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCK_MS = 10 * 60 * 1000;

function isLocked(key) {
  const rec = attempts.get(key);
  if (!rec) return false;
  if (rec.count < MAX_ATTEMPTS) return false;
  if (Date.now() - rec.last > LOCK_MS) { attempts.delete(key); return false; }
  return true;
}
function recordFail(key) {
  const rec = attempts.get(key) || { count: 0, last: 0 };
  rec.count += 1; rec.last = Date.now();
  attempts.set(key, rec);
}

// ---------------------------------------------------------------- REGISTER --
router.post("/register", (req, res) => {
  const { full_name, email, phone, password, confirm, role, skills, district } = req.body || {};
  const errors = [];

  if (!full_name || full_name.trim().length < 2) errors.push("Enter your full name.");
  if (!email || !EMAIL_RE.test(email.trim())) errors.push("Enter a valid email address.");
  if (!phone || !PHONE_RE.test(phone.trim())) errors.push("Enter a valid phone number (0XXXXXXXXX).");
  if (!password || password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password))
    errors.push("Password must be at least 8 characters with letters and numbers.");
  if (password !== confirm) errors.push("Passwords do not match.");
  if (!["citizen", "volunteer"].includes(role)) errors.push("Choose an account type.");

  let skillsJson = null, districtVal = null;
  if (role === "volunteer") {
    const list = Array.isArray(skills) ? skills.filter((s) => SKILLS.includes(s)) : [];
    if (list.length === 0) errors.push("Select at least one volunteer skill.");
    if (!DISTRICTS.includes(district)) errors.push("Select your district.");
    skillsJson = JSON.stringify(list);
    districtVal = district;
  }

  if (errors.length) return res.status(400).json({ ok: false, errors });

  try {
    const hash = bcrypt.hashSync(password, 10);
    const info = db.prepare(
      "INSERT INTO users (full_name, email, phone, password, role, skills, district) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).run(full_name.trim(), email.trim().toLowerCase(), phone.trim(), hash, role, skillsJson, districtVal);

    req.session.regenerate((err) => {
      if (err) return res.status(500).json({ ok: false, errors: ["Something went wrong. Try again."] });
      req.session.user = { id: info.lastInsertRowid, name: full_name.trim(), role };
      res.json({ ok: true, redirect: "/dashboard" });
    });
  } catch (e) {
    if (String(e.message).includes("UNIQUE"))
      return res.status(409).json({ ok: false, errors: ["An account with this email already exists."] });
    res.status(500).json({ ok: false, errors: ["Something went wrong. Try again."] });
  }
});

// ------------------------------------------------------------------- LOGIN --
router.post("/login", (req, res) => {
  const { email, password } = req.body || {};
  const key = (email || "").trim().toLowerCase();

  if (isLocked(key))
    return res.status(429).json({ ok: false, errors: ["Too many failed attempts. Try again in 10 minutes."] });

  const generic = { ok: false, errors: ["Incorrect email or password."] };
  if (!key || !password) return res.status(400).json(generic);

  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(key);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    recordFail(key);
    return res.status(401).json(generic);
  }

  attempts.delete(key);
  req.session.regenerate((err) => {
    if (err) return res.status(500).json({ ok: false, errors: ["Something went wrong. Try again."] });
    req.session.user = { id: user.id, name: user.full_name, role: user.role };
    res.json({ ok: true, redirect: "/dashboard" });
  });
});

// ------------------------------------------------------------------ LOGOUT --
router.post("/logout", (req, res) => {
  req.session.destroy(() => res.json({ ok: true, redirect: "/login" }));
});

// ---------------------------------------------------------------------- ME --
router.get("/me", (req, res) => {
  if (!req.session.user) return res.status(401).json({ ok: false });
  const u = db.prepare("SELECT id, full_name, email, role, skills, district, trust_score, created_at FROM users WHERE id = ?")
    .get(req.session.user.id);
  if (!u) return res.status(401).json({ ok: false });
  res.json({ ok: true, user: u });
});

// Trust history — the REAL events behind the score, so it's provably not a
// static number: how many of this user's reports were verified genuine vs false.
router.get("/me/trust", (req, res) => {
  if (!req.session.user) return res.status(401).json({ ok: false });
  const uid = req.session.user.id;
  const row = db.prepare(`
    SELECT
      COUNT(*)                                           AS total,
      SUM(status = 'resolved')                           AS resolved,
      SUM(status = 'resolved' AND false_report = 0)      AS genuine,
      SUM(status = 'resolved' AND false_report = 1)      AS false_reports
    FROM incidents WHERE citizen_id = ?`).get(uid);
  const u = db.prepare("SELECT trust_score, created_at FROM users WHERE id = ?").get(uid);
  res.json({
    ok: true,
    score: u.trust_score,
    total: row.total || 0,
    resolved: row.resolved || 0,
    genuine: row.genuine || 0,
    false_reports: row.false_reports || 0,
    member_since: u.created_at,
  });
});

module.exports = router;
