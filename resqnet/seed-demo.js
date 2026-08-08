// ============================================================
//  ResQNet — Demo Data Seeder
//  Run once to populate the app with realistic sample data
//  for a demo or presentation:  node seed-demo.js
//  (Safe to re-run — it clears old demo data first.)
// ============================================================
const db = require("./db/database");
const bcrypt = require("bcryptjs");

console.log("Seeding ResQNet demo data...");

// ---- 1. Clear previous demo rows (keeps admin + guest) ----
db.exec("DELETE FROM messages");
db.exec("DELETE FROM incidents");
db.exec("DELETE FROM shelters");
db.exec("DELETE FROM missing_persons");
db.exec("DELETE FROM broadcasts");
db.exec("DELETE FROM users WHERE role IN ('citizen','volunteer')");

const pw = bcrypt.hashSync("Demo@2026", 10);

// ---- 2. Citizens ----
const insUser = db.prepare(
  "INSERT INTO users (full_name, email, phone, password, role, skills, district, trust_score) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
);
const citizens = [
  ["Nimal Perera",     "nimal@demo.lk",   "0771234501", "citizen", null, null, 100],
  ["Kumari Silva",     "kumari@demo.lk",  "0771234502", "citizen", null, null, 95],
  ["Ashan Fernando",   "ashan@demo.lk",   "0771234503", "citizen", null, null, 100],
  ["Dilani Jayasuriya","dilani@demo.lk",  "0771234504", "citizen", null, null, 60], // lower trust (had a false report)
  ["Ravi Bandara",     "ravi@demo.lk",    "0771234505", "citizen", null, null, 100],
];
const citizenIds = citizens.map(c => insUser.run(c[0],c[1],c[2],pw,c[3],c[4],c[5],c[6]).lastInsertRowid);

// ---- 3. Volunteers (with skills + district) ----
const volunteers = [
  ["Saman Wickrama", "saman@demo.lk", "0777654301", "volunteer", JSON.stringify(["medical","rescue"]),   "Kandy",   100],
  ["Tharaka Mendis", "tharaka@demo.lk","0777654302", "volunteer", JSON.stringify(["evacuation","driver"]),"Colombo", 100],
  ["Ishara Gunawardena","ishara@demo.lk","0777654303","volunteer", JSON.stringify(["first-aid","water"]),  "Galle",   100],
];
const volIds = volunteers.map(v => insUser.run(v[0],v[1],v[2],pw,v[3],v[4],v[5],v[6]).lastInsertRowid);

// ---- 4. Incidents (real Sri Lankan coordinates) ----
const insInc = db.prepare(
  "INSERT INTO incidents (citizen_id, type, description, lat, lng, resource, severity, status, responder_id, responded_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
);
// [citizen_idx, type, description, lat, lng, resource, severity, status, responder_idx(or null)]
const incidents = [
  [0, "flood",   "Flooding near the river, water rising fast. Need evacuation help.",         7.2906, 80.6337, "evacuation", 3, "responding", 0], // Kandy - Saman responding
  [1, "medical", "Elderly person collapsed, needs urgent medical attention.",                 6.9271, 79.8612, "medical",    3, "active",     null], // Colombo
  [2, "fire",    "House fire spreading to nearby homes in the area.",                          6.0535, 80.2210, "evacuation", 3, "active",     null], // Galle
  [4, "accident","Road accident on the main road, two vehicles involved.",                    7.2906, 80.6350, "medical",    2, "resolved",   0], // Kandy - resolved
  [0, "flood",   "Water entering ground floor homes, families need shelter and clean water.", 7.2950, 80.6300, "water",      2, "active",     null], // Kandy cluster
  [1, "medical", "Child with high fever, family cannot reach hospital due to flooding.",       6.9280, 79.8600, "medical",    2, "responding", 1], // Colombo - Tharaka responding
];
const incIds = incidents.map(i =>
  insInc.run(citizenIds[i[0]], i[1], i[2], i[3], i[4], i[5], i[6], i[7],
             i[8]===null?null:volIds[i[8]],
             i[8]===null?null:new Date().toISOString())
    .lastInsertRowid
);

// ---- 5. Messages on an active response (citizen <-> volunteer coordination) ----
const insMsg = db.prepare("INSERT INTO messages (incident_id, sender_id, body) VALUES (?, ?, ?)");
insMsg.run(incIds[0], citizenIds[0], "Please hurry, the water is up to our knees now.");
insMsg.run(incIds[0], volIds[0],     "On my way with the rescue team, stay on higher ground. ETA 10 minutes.");
insMsg.run(incIds[0], citizenIds[0], "Thank you, we are on the roof waiting.");

// ---- 6. Shelters ----
const insShelter = db.prepare(
  "INSERT INTO shelters (name, district, lat, lng, capacity, occupancy, contact, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
);
insShelter.run("Kandy Community Hall",      "Kandy",   7.2931, 80.6350, 200, 85,  "0812234567", "Dry food and water available");
insShelter.run("Colombo Central School",    "Colombo", 6.9320, 79.8580, 350, 120, "0112345678", "Medical station on site");
insShelter.run("Galle Public Grounds Camp",  "Galle",   6.0500, 80.2170, 150, 40,  "0912223344", "Tents set up, space available");

// ---- 7. Missing persons ----
const insMissing = db.prepare(
  "INSERT INTO missing_persons (name, age, description, last_seen, district, lat, lng, contact, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
);
insMissing.run("Sunil Rajapaksa", 68, "Elderly man, wearing a white shirt and sarong. Hard of hearing.", "Near Kandy river bank", "Kandy", 7.2910, 80.6340, "0771111222", "missing");
insMissing.run("Amara Dissanayake", 9, "Young girl in a blue dress, separated from family during evacuation.", "Colombo Central School area", "Colombo", 6.9315, 79.8585, "0772223344", "missing");
insMissing.run("Chaminda Perera", 34, "Went to help neighbours, not returned. Wearing red t-shirt.", "Galle flood zone", "Galle", 6.0520, 80.2200, "0773334455", "found");

// ---- 8. One organisation broadcast ----
const adminId = db.prepare("SELECT id FROM users WHERE role='admin' LIMIT 1").get().id;
db.prepare("INSERT INTO broadcasts (admin_id, district, body) VALUES (?, ?, ?)")
  .run(adminId, "Kandy", "Flood warning for Kandy district. Please move to higher ground and head to Kandy Community Hall if you need shelter.");

console.log("Demo data seeded successfully.");
console.log("  Citizens:", citizenIds.length, "| Volunteers:", volIds.length, "| Incidents:", incIds.length);
console.log("  Shelters: 3 | Missing persons: 3 | Messages: 3 | Broadcasts: 1");
console.log("");
console.log("Demo logins (all use password: Demo@2026):");
console.log("  Citizen:   nimal@demo.lk");
console.log("  Volunteer: saman@demo.lk");
console.log("  Admin:     admin@resqnet.lk / Admin@2026");
