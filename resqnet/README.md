# ResQNet — Community Emergency Response Network

> A real-time platform connecting citizens, volunteers, and organisations to coordinate emergency response across Sri Lanka.

**Module:** CIS047-3 Agile Project Management
**Client:** Sri Lanka Red Cross Society
**Duration:** 21 June – 22 August 2026

---

## Overview

ResQNet is a community emergency response web application built for the Sri Lanka Red Cross Society. It brings three groups together on one live platform:

- **Citizens** report emergencies with their location (and optional photo) — no account needed for urgent reports.
- **Volunteers** receive alerts matched to their skills and district, and respond in real time.
- **Organisations** get a live command dashboard showing incidents, resource needs, and volunteer activity aggregated by district.

The goal is faster, better-coordinated emergency response — turning scattered messages into a single coordinated picture.

---

## Key Features

- **Emergency reporting** with automatic GPS location and photo evidence
- **No-login Quick Report** so anyone can report in an emergency without an account
- **SOS** one-tap alert to every nearby volunteer
- **Live incident map** with a risk heatmap of high-risk zones
- **Skill-matched volunteer alerts** routed by skill and district
- **Community Trust Score** to help distinguish genuine reports from false ones
- **Two-way messaging** between citizens and responders
- **Resource requests with amounts** (e.g. Water ×50, Blankets ×20)
- **Live responder location tracking** and delivery confirmations
- **Organisation dashboard** aggregating needs by district
- **Public transparency feed** and post-incident reports

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express |
| Database | SQLite (Node built-in `node:sqlite`) |
| Frontend | HTML, CSS, JavaScript |
| Mapping | Leaflet + OpenStreetMap |
| Weather | Open-Meteo API (free, no key) |

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or later)

### Run locally
```bash
# 1. Go into the app folder
cd resqnet

# 2. Install dependencies
npm install

# 3. Start the server
npm start
```

Then open **http://localhost:3000** in your browser.

### Default accounts (for testing)
| Role | Email | Password |
|------|-------|----------|
| Admin / Organisation | admin@resqnet.lk | Admin@2026 |

Citizens and volunteers can register from the sign-up page.

---

## Project Management

This project was managed using an **Agile approach (Scrum + Kanban)**, coordinated through a Trello board as the team's information radiator. Work was organised into three sprints:

1. **Sprint 1 — Core Platform** (21 Jun – 11 Jul)
2. **Sprint 2 — Intelligent Response** (12 Jul – 1 Aug)
3. **Sprint 3 — Organisation Intelligence** (2 Aug – 22 Aug)

Requirements were gathered iteratively from the client and refined through three stakeholder review presentations.

---

## Team

| Member | Role |
|--------|------|
| Hishma Izamy | Project Manager |
| Seif Feroz | Start-up Manager (Lead Developer) |
| Himashi Chandrarathna | Quality Manager |
| Gayathri Senavirathna | Risk Manager |
| Nethmi Bandusena | Scheduling Manager |

---

## Notes

- Some features (SMS/WhatsApp reporting, real SMS broadcast) were deliberately deferred to the backlog as they require paid external services beyond the project's scope.
- The risk heatmap and escalation logic are **rule-based**, not AI.

---

*Built as a university group project for the Sri Lanka Red Cross Society.*
