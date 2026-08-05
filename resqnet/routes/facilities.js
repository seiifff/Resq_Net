// ResQNet — Facilities routes (Sprint 3 add-on)
// Shelters (emergency accommodation) + Missing persons register.
// Both are free to build on our existing stack — no paid services.
const express = require("express");
const db = require("../db/database");
const { districtFor } = require("./districts");

const router = express.Router();

const requireLogin = (req, res, next) =>
  req.session.user ? next() : res.status(401).json({ ok: false, errors: ["Sign in first."] });

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function clampStr(v, max) {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s ? s.slice(0, max) : null;
}

/* ---------------- SHELTERS ---------------- */

// List all shelters (public — citizens need to find shelter)
router.get("/shelters", (req, res) => {
  const rows = db.prepare(
    `SELECT id, name, district, lat, lng, capacity, occupancy, contact, notes, created_at
     FROM shelters ORDER BY created_at DESC`
  ).all();
  res.json({ ok: true, shelters: rows });
});

// Create a shelter (logged-in users — e.g. organisation/volunteers)
router.post("/shelters", requireLogin, (req, res) => {
  const name = clampStr(req.body.name, 120);
  const lat = num(req.body.lat);
  const lng = num(req.body.lng);
  if (!name || lat === null || lng === null) {
    return res.status(400).json({ ok: false, errors: ["Name and location are required."] });
  }
  const capacity = Math.max(0, Math.min(100000, parseInt(req.body.capacity, 10) || 0));
  const occupancy = Math.max(0, Math.min(capacity || 100000, parseInt(req.body.occupancy, 10) || 0));
  const district = clampStr(req.body.district, 60) || districtFor(lat, lng);
  const contact = clampStr(req.body.contact, 60);
  const notes = clampStr(req.body.notes, 400);

  const info = db.prepare(
    `INSERT INTO shelters (name, district, lat, lng, capacity, occupancy, contact, notes, created_by)
     VALUES (?,?,?,?,?,?,?,?,?)`
  ).run(name, district, lat, lng, capacity, occupancy, contact, notes, req.session.user.id);
  res.json({ ok: true, id: info.lastInsertRowid });
});

// Update occupancy (quick +/- as people arrive/leave)
router.post("/shelters/:id(\\d+)/occupancy", requireLogin, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const sh = db.prepare(`SELECT capacity FROM shelters WHERE id=?`).get(id);
  if (!sh) return res.status(404).json({ ok: false, errors: ["Shelter not found."] });
  let occ = parseInt(req.body.occupancy, 10);
  if (!Number.isFinite(occ)) return res.status(400).json({ ok: false, errors: ["Occupancy required."] });
  occ = Math.max(0, Math.min(sh.capacity || 100000, occ));
  db.prepare(`UPDATE shelters SET occupancy=? WHERE id=?`).run(occ, id);
  res.json({ ok: true, occupancy: occ });
});

/* ---------------- MISSING PERSONS ---------------- */

// List missing persons (public register)
router.get("/missing", (req, res) => {
  const rows = db.prepare(
    `SELECT id, name, age, description, last_seen, district, lat, lng, contact, status, created_at
     FROM missing_persons ORDER BY (status='missing') DESC, created_at DESC`
  ).all();
  res.json({ ok: true, people: rows });
});

// Report a missing person (logged in)
router.post("/missing", requireLogin, (req, res) => {
  const name = clampStr(req.body.name, 120);
  if (!name) return res.status(400).json({ ok: false, errors: ["Name is required."] });
  const age = req.body.age ? Math.max(0, Math.min(130, parseInt(req.body.age, 10) || 0)) : null;
  const description = clampStr(req.body.description, 500);
  const last_seen = clampStr(req.body.last_seen, 200);
  const lat = num(req.body.lat);
  const lng = num(req.body.lng);
  const district = clampStr(req.body.district, 60) || (lat !== null && lng !== null ? districtFor(lat, lng) : null);
  const contact = clampStr(req.body.contact, 60);

  const info = db.prepare(
    `INSERT INTO missing_persons (name, age, description, last_seen, district, lat, lng, contact, reported_by)
     VALUES (?,?,?,?,?,?,?,?,?)`
  ).run(name, age, description, last_seen, district, lat, lng, contact, req.session.user.id);
  res.json({ ok: true, id: info.lastInsertRowid });
});

// Mark a person as found
router.post("/missing/:id(\\d+)/found", requireLogin, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const row = db.prepare(`SELECT id FROM missing_persons WHERE id=?`).get(id);
  if (!row) return res.status(404).json({ ok: false, errors: ["Record not found."] });
  db.prepare(`UPDATE missing_persons SET status='found' WHERE id=?`).run(id);
  res.json({ ok: true });
});

module.exports = router;
