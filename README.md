# ResQNet: Community Emergency Response Network

ResQNet connects the people who witness an emergency, the volunteers who can respond and the organisations that coordinate them, on one live network covering all 25 districts of Sri Lanka.

Built as a university group project in three Agile sprints.

![Node.js](https://img.shields.io/badge/Node.js-22.5%2B-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-built--in-003B57?logo=sqlite&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet-OpenStreetMap-199900?logo=leaflet&logoColor=white)

## Features

**Citizens**
- Report an incident (flood, fire, accident, medical) with automatic GPS location, photo upload and resource needs (water, medical, evacuation, food)
- One-tap **SOS**: maximum severity, escalated immediately and sent to every nearby volunteer
- **Quick report without an account**, with a public tracking page for the report's status
- Interface in **Sinhala, Tamil and English**

**Volunteers**
- **Skill-matched alerts** (flood response, fire safety, medical, search & rescue, logistics, communications)
- "I'm responding" lock, 15-minute check-in countdown, and automatic escalation if nobody responds within 10 minutes
- Two-way chat with the reporter and admins on every incident
- Trust score for reporters (genuine reports raise it, false reports lower it)

**Organisations / admins**
- Live dashboard: active, responding, resolved and escalated incidents, and average response time
- Resource needs rolled up by district, hotspot districts and most active volunteers
- **Cluster escalation**: 3+ reports within ~5 km in 30 minutes raise the whole cluster to high severity
- Rule-based **responder deployment recommendations** that show the evidence behind each one
- Risk heatmap, district broadcast warnings, printable post-incident reports
- Public, anonymised **transparency feed** of resolved incidents

## Tech stack

| Layer | Technology |
|---|---|
| Backend | Node.js 22.5+, Express, express-session |
| Database | SQLite via Node's built-in `node:sqlite` (prepared statements throughout) |
| Auth | bcrypt password hashing, session login, role-based access, login throttling (5 attempts → 10-minute lockout) |
| Maps | Leaflet + OpenStreetMap, heatmap plugin (bundled locally, no API key) |
| Charts | Chart.js |
| Weather | Open-Meteo API with an offline fallback |
| Uploads | multer (images up to 5 MB) |

District detection runs offline (nearest-centroid lookup over the 25 districts), and escalation rules run as a sweep on each read, so no background jobs are needed.

## Run it locally

Requires Node.js 22.5 or newer.

```bash
cd resqnet
npm install
npm start            # http://localhost:3000
node seed-demo.js    # optional: load demo users and incidents
```

The SQLite database (`db/resqnet.db`) is created on first run, with a seeded admin account (see `db/database.js`). Set `SESSION_SECRET` and change the seeded admin password before deploying anywhere public.

## Project structure

```
resqnet/
├── server.js          Express app and protected page routes
├── routes/            auth, incidents, admin, districts, facilities APIs
├── db/database.js     schema, migrations and admin seed
├── seed-demo.js       demo data
└── public/            HTML pages, CSS, client JS, bundled Leaflet
```

## Scope decisions

Left out on purpose: SMS/WhatsApp gateways (need paid accounts), turn-by-turn evacuation routing (needs a paid directions API, and a straight-line guess would be unsafe), and full shelter and missing-person modules (each needs its own data model and privacy framework).

The full sprint-by-sprint build history is in [resqnet/CHANGELOG.md](resqnet/CHANGELOG.md).
