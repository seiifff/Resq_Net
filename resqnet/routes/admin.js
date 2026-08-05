// ResQNet — Sprint 3: organisation/admin intelligence
const express = require("express");
const db = require("../db/database");
const { DISTRICT_NAMES } = require("./districts");

const router = express.Router();

const requireLogin = (req, res, next) =>
  req.session.user ? next() : res.status(401).json({ ok: false, errors: ["Sign in first."] });
const requireAdmin = (req, res, next) =>
  req.session.user?.role === "admin" ? next() : res.status(403).json({ ok: false, errors: ["Admins only."] });

// ------------------------------------------------------------ ADMIN STATS --
router.get("/admin/stats", requireLogin, requireAdmin, (req, res) => {
  const kpi = db.prepare(`
    SELECT COUNT(*) AS total,
      SUM(status='active')     AS active,
      SUM(status='responding') AS responding,
      SUM(status='resolved')   AS resolved,
      SUM(false_report)        AS false_reports,
      SUM(sos AND status != 'resolved') AS sos_open,
      SUM(escalated)           AS escalated
    FROM incidents`).get();

  const times = db.prepare(`
    SELECT
      AVG((julianday(responded_at) - julianday(created_at)) * 1440) AS avg_response_min,
      AVG((julianday(resolved_at)  - julianday(created_at)) * 1440) AS avg_resolve_min
    FROM incidents WHERE responded_at IS NOT NULL`).get();

  // Aggregated resource requests by district — "25× water — Kandy"
  const resources = db.prepare(`
    SELECT district, resource, COUNT(*) AS n
    FROM incidents
    WHERE resource IS NOT NULL AND status != 'resolved'
    GROUP BY district, resource ORDER BY n DESC, district`).all();

  // Aggregated resource NEEDS with quantities, grouped by district + item.
  // needs is JSON [{item, qty}]; we sum numeric quantities per item per district.
  const needRows = db.prepare(`
    SELECT district, needs FROM incidents
    WHERE needs IS NOT NULL AND status != 'resolved'`).all();
  const needMap = {}; // { district: { item: {qty, count} } }
  for (const r of needRows) {
    let list; try { list = JSON.parse(r.needs); } catch { continue; }
    if (!Array.isArray(list)) continue;
    const d = r.district || "Unknown";
    needMap[d] = needMap[d] || {};
    for (const n of list) {
      const item = (n.item || "").trim(); if (!item) continue;
      const num = parseInt(String(n.qty).replace(/[^0-9]/g, ""), 10);
      needMap[d][item] = needMap[d][item] || { qty: 0, count: 0, hasNum: false };
      if (Number.isFinite(num)) { needMap[d][item].qty += num; needMap[d][item].hasNum = true; }
      needMap[d][item].count += 1;
    }
  }
  const needs = [];
  for (const [district, items] of Object.entries(needMap))
    for (const [item, v] of Object.entries(items))
      needs.push({ district, item, qty: v.qty, count: v.count, hasNum: v.hasNum });
  needs.sort((a, b) => b.qty - a.qty || b.count - a.count);

  // Hotspot districts (all incidents, most first)
  const hotspots = db.prepare(`
    SELECT district, COUNT(*) AS n, SUM(status='active') AS active
    FROM incidents GROUP BY district ORDER BY n DESC LIMIT 8`).all();

  // Most active volunteers
  const volunteers = db.prepare(`
    SELECT u.full_name, COUNT(*) AS responses,
           SUM(i.status='resolved' AND i.false_report=0) AS resolved
    FROM incidents i JOIN users u ON u.id = i.responder_id
    GROUP BY i.responder_id ORDER BY responses DESC LIMIT 8`).all();

  // ---- Responder deployment recommendations ----
  // Rule-based, and every recommendation states the evidence behind it, so an
  // organisation can audit why it was made rather than trusting a black box.
  const districtLoad = db.prepare(`
    SELECT district,
      COUNT(*) AS unresolved,
      SUM(status='active')     AS unattended,
      SUM(sos)                 AS sos_count,
      SUM(escalated)           AS escalated,
      MAX(severity)            AS worst,
      SUM(resource IS NOT NULL) AS resource_needs
    FROM incidents
    WHERE status != 'resolved'
    GROUP BY district ORDER BY unattended DESC, unresolved DESC`).all();

  const volunteersByDistrict = db.prepare(`
    SELECT district, COUNT(*) AS n FROM users
    WHERE role = 'volunteer' AND district IS NOT NULL GROUP BY district`).all();
  const volMap = Object.fromEntries(volunteersByDistrict.map((v) => [v.district, v.n]));

  const recommendations = districtLoad.map((d) => {
    const available = volMap[d.district] || 0;
    // Each unattended incident needs a responder; high severity warrants two.
    const needed = (d.unattended || 0) + (d.worst === 3 ? (d.unattended || 0) : 0) + (d.sos_count || 0);
    const gap = Math.max(0, needed - available);
    const reasons = [];
    if (d.sos_count) reasons.push(`${d.sos_count} SOS`);
    if (d.unattended) reasons.push(`${d.unattended} unattended`);
    if (d.escalated) reasons.push(`${d.escalated} escalated`);
    if (d.worst === 3) reasons.push("high severity");
    if (d.resource_needs) reasons.push(`${d.resource_needs} resource requests`);
    let priority = "low";
    if (d.sos_count || (d.worst === 3 && gap > 0)) priority = "critical";
    else if (gap > 0 || d.escalated) priority = "high";
    else if (d.unattended) priority = "medium";
    return {
      district: d.district, priority, needed, available, gap,
      unresolved: d.unresolved, resource_needs: d.resource_needs,
      reason: reasons.join(" · ") || "monitoring",
    };
  }).sort((a, b) => ({ critical: 0, high: 1, medium: 2, low: 3 })[a.priority] - ({ critical: 0, high: 1, medium: 2, low: 3 })[b.priority] || b.gap - a.gap);

  const recent = db.prepare(`
    SELECT i.id, i.type, i.district, i.severity, i.status, i.escalated, i.resource, i.sos, i.created_at,
           u.full_name AS reporter
    FROM incidents i JOIN users u ON u.id = i.citizen_id
    ORDER BY i.created_at DESC LIMIT 12`).all();

  res.json({ ok: true, kpi, times, resources, needs, hotspots, volunteers, recommendations, recent, districts: DISTRICT_NAMES });
});

// ---------------------------------------------------- BROADCAST WARNINGS --
// Demo build: broadcasts appear as banners in-app. In production this feeds an
// SMS gateway (e.g. Twilio/Dialog Ideamart) — same data model, swapped transport.
router.post("/admin/broadcast", requireLogin, requireAdmin, (req, res) => {
  const { district, body } = req.body || {};
  const target = district === "ALL" || DISTRICT_NAMES.includes(district) ? district : null;
  const text = (body || "").trim();
  if (!target) return res.status(400).json({ ok: false, errors: ["Pick a district (or ALL)."] });
  if (!text || text.length > 300) return res.status(400).json({ ok: false, errors: ["Warning text must be 1–300 characters."] });
  db.prepare("INSERT INTO broadcasts (admin_id, district, body) VALUES (?, ?, ?)")
    .run(req.session.user.id, target, text);
  res.json({ ok: true });
});

// Latest broadcast within 24h → shown as a banner to all signed-in users
router.get("/broadcasts/latest", requireLogin, (req, res) => {
  const b = db.prepare(`
    SELECT district, body, created_at FROM broadcasts
    WHERE created_at >= datetime('now','-1 day')
    ORDER BY created_at DESC LIMIT 1`).get() || null;
  res.json({ ok: true, broadcast: b });
});

// -------------------------------------------------- RISK HEATMAP DATA --
// Historical risk view: every incident ever reported (including resolved),
// weighted by severity, with recent incidents weighted slightly higher.
router.get("/heatmap", requireLogin, (req, res) => {
  const rows = db.prepare(`
    SELECT lat, lng, severity,
      CASE WHEN created_at >= datetime('now','-7 days') THEN 1 ELSE 0 END AS recent
    FROM incidents`).all();
  const points = rows.map((r) => [r.lat, r.lng, Math.max(0.9, (r.severity / 3) * (r.recent ? 1.0 : 0.85))]);
  res.json({ ok: true, points });
});

// ------------------------------------------------- RECRUITMENT STATS --
// Public, no login. Real numbers for the volunteer recruitment page.
router.get("/recruit-stats", (req, res) => {
  const v = db.prepare("SELECT COUNT(*) AS n FROM users WHERE role = 'volunteer'").get();
  const inc = db.prepare(`
    SELECT SUM(status='resolved') AS resolved, COUNT(*) AS total,
      COUNT(DISTINCT district) AS districts
    FROM incidents`).get();
  res.json({
    ok: true,
    volunteers: v.n || 0,
    resolved: inc.resolved || 0,
    total: inc.total || 0,
    districts: inc.districts || 0,
  });
});

// ------------------------------------------- PUBLIC TRANSPARENCY FEED --
// No login required. Resolved incidents only, fully anonymised.
router.get("/feed", (req, res) => {
  const rows = db.prepare(`
    SELECT type, district, severity, false_report, created_at, resolved_at,
      CAST((julianday(COALESCE(responded_at, resolved_at)) - julianday(created_at)) * 1440 AS INTEGER) AS response_min
    FROM incidents WHERE status = 'resolved'
    ORDER BY resolved_at DESC LIMIT 100`).all();
  const totals = db.prepare(`
    SELECT COUNT(*) AS resolved,
      CAST(AVG((julianday(responded_at) - julianday(created_at)) * 1440) AS INTEGER) AS avg_response_min
    FROM incidents WHERE status='resolved' AND responded_at IS NOT NULL`).get();
  res.json({ ok: true, feed: rows, totals });
});

// ------------------------------------------- POST-INCIDENT REPORT (HTML) --
router.get("/incidents/:id/report", requireLogin, (req, res) => {
  const i = db.prepare(`
    SELECT i.*, u.full_name AS reporter, r.full_name AS responder
    FROM incidents i JOIN users u ON u.id = i.citizen_id
    LEFT JOIN users r ON r.id = i.responder_id WHERE i.id = ?`).get(req.params.id);
  if (!i) return res.status(404).send("Not found");
  const me = req.session.user;
  const allowed = me.role === "admin" || i.citizen_id === me.id || i.responder_id === me.id;
  if (!allowed) return res.status(403).send("Not permitted");
  if (i.status !== "resolved") return res.status(409).send("Report available once the incident is resolved.");

  const msgs = db.prepare("SELECT COUNT(*) AS n FROM messages WHERE incident_id = ?").get(i.id).n;
  const NAME = { flood: "Flood", fire: "Fire", accident: "Road accident", medical: "Medical emergency" };
  const min = (a, b) => a && b ? Math.round((new Date(b + "Z") - new Date(a + "Z")) / 60000) : null;
  const fmt = (d) => d ? new Date(d + "Z").toLocaleString("en-GB", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

  res.send(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Post-incident report #${i.id} — ResQNet</title>
  <style>
    body{font-family:Georgia,serif;max-width:720px;margin:40px auto;padding:0 24px;color:#1a1a1a;line-height:1.6}
    h1{font-size:22px;border-bottom:3px solid #E5484D;padding-bottom:10px}
    h2{font-size:15px;margin-top:26px;text-transform:uppercase;letter-spacing:.08em;color:#666}
    table{width:100%;border-collapse:collapse;margin-top:8px}
    td{padding:7px 10px;border-bottom:1px solid #e5e5e5;font-size:14px}
    td:first-child{color:#666;width:220px}
    .stamp{margin-top:36px;font-size:12px;color:#888}
    .flag{display:inline-block;padding:2px 10px;border-radius:99px;font-size:12px;font-weight:bold}
    .ok{background:#DCFAF4;color:#0B7A66}.bad{background:#FDE3E4;color:#B02A2E}
    @media print{.noprint{display:none}}
  </style></head><body>
  <h1>ResQNet — Post-Incident Report #${i.id}</h1>
  <h2>Incident summary</h2>
  <table>
    <tr><td>Type</td><td>${NAME[i.type]}</td></tr>
    <tr><td>District</td><td>${i.district || "—"}</td></tr>
    <tr><td>Location</td><td>${i.lat.toFixed(5)}, ${i.lng.toFixed(5)}</td></tr>
    <tr><td>Severity</td><td>${["", "Low", "Medium", "High"][i.severity]}${i.escalated ? " (escalated)" : ""}</td></tr>
    <tr><td>Resource requested</td><td>${i.resource || "None"}</td></tr>
    <tr><td>Outcome</td><td>${i.false_report ? '<span class="flag bad">Closed — false report</span>' : '<span class="flag ok">Resolved — genuine</span>'}</td></tr>
  </table>
  <h2>Timeline</h2>
  <table>
    <tr><td>Reported</td><td>${fmt(i.created_at)}</td></tr>
    <tr><td>Volunteer responded</td><td>${fmt(i.responded_at)}${min(i.created_at, i.responded_at) !== null ? ` — <b>${min(i.created_at, i.responded_at)} min</b> after report` : ""}</td></tr>
    <tr><td>Resolved</td><td>${fmt(i.resolved_at)}${min(i.created_at, i.resolved_at) !== null ? ` — <b>${min(i.created_at, i.resolved_at)} min</b> total` : ""}</td></tr>
  </table>
  <h2>Participants</h2>
  <table>
    <tr><td>Reported by</td><td>${i.reporter}</td></tr>
    <tr><td>Responder</td><td>${i.responder || "—"}</td></tr>
    <tr><td>Coordination messages</td><td>${msgs}</td></tr>
  </table>
  <p class="stamp">Auto-generated by ResQNet · ${new Date().toLocaleString("en-GB")} · Community Emergency Intelligence &amp; Response Network</p>
  <p class="noprint"><a href="javascript:print()">Print / save as PDF</a> · <a href="/incident/${i.id}">Back to incident</a></p>
  </body></html>`);
});

module.exports = router;
