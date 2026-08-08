// ResQNet — Server (Sprint 1: Authentication)
const express = require("express");
const session = require("express-session");
const path = require("path");

const authRoutes = require("./routes/auth");
const incidentRoutes = require("./routes/incidents");
const adminRoutes = require("./routes/admin");
const facilitiesRoutes = require("./routes/facilities");

const app = express();
app.set("trust proxy", 1); // correct client IPs & cookies behind tunnels/hosting proxies
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "resqnet-dev-secret-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: "lax", maxAge: 1000 * 60 * 60 * 8 },
  })
);

// API
app.use("/api", authRoutes);
app.use("/api", incidentRoutes);
app.use("/api", adminRoutes);
app.use("/api", facilitiesRoutes);

// Page routes (protect dashboard, keep auth pages away from logged-in users)
const pub = path.join(__dirname, "public");
const requireLogin = (req, res, next) => (req.session.user ? next() : res.redirect("/login"));
const requireGuest = (req, res, next) => (req.session.user ? res.redirect("/dashboard") : next());

app.get("/", (req, res) => res.sendFile(path.join(pub, "index.html")));
app.get("/login", requireGuest, (req, res) => res.sendFile(path.join(pub, "login.html")));
app.get("/register", requireGuest, (req, res) => res.sendFile(path.join(pub, "register.html")));
app.get("/dashboard", requireLogin, (req, res) => res.sendFile(path.join(pub, "dashboard.html")));
app.get("/report", requireLogin, (req, res) => res.sendFile(path.join(pub, "report.html")));
app.get("/map", requireLogin, (req, res) => res.sendFile(path.join(pub, "map.html")));
app.get("/incident/:id", requireLogin, (req, res) => res.sendFile(path.join(pub, "incident.html")));
const requireAdmin = (req, res, next) =>
  req.session.user?.role === "admin" ? next() : res.redirect("/dashboard");
app.get("/admin", requireLogin, requireAdmin, (req, res) => res.sendFile(path.join(pub, "admin.html")));
app.get("/feed", (req, res) => res.sendFile(path.join(pub, "feed.html")));
app.get("/quick-report", (req, res) => res.sendFile(path.join(pub, "quick-report.html")));
app.get("/volunteer", (req, res) => res.sendFile(path.join(pub, "volunteer.html")));
app.get("/track/:id", (req, res) => res.sendFile(path.join(pub, "track.html")));
app.get("/shelters", (req, res) => res.sendFile(path.join(pub, "shelters.html")));
app.get("/missing", (req, res) => res.sendFile(path.join(pub, "missing.html")));
app.get("/safe-route", (req, res) => res.sendFile(path.join(pub, "safe-route.html")));

// Uploaded incident photos (login required)
app.use("/uploads", requireLogin, express.static(path.join(__dirname, "uploads")));

app.use(express.static(pub));

// Friendly 404 for any unmatched route (must be after static + all routes)
app.use((req, res) => {
  if (req.path.startsWith("/api/")) return res.status(404).json({ ok: false, errors: ["Not found."] });
  res.status(404).sendFile(path.join(pub, "404.html"));
});

// Auto-load demo data on startup if the database is empty.
// This keeps the app populated for demos on hosts (like Render's free
// tier) that reset the database on redeploy, without needing shell access.
// It only seeds when there are no incidents yet, so it never overwrites
// real data. Set SEED_DEMO=off in the environment to disable.
try {
  if (process.env.SEED_DEMO !== "off") {
    const seed = require("./seed-demo");
    const result = seed();
    if (result.seeded) console.log("  Demo data loaded on startup.");
  }
} catch (e) {
  console.error("  Demo seed skipped:", e.message);
}

app.listen(PORT, () => {
  console.log(`\n  ResQNet running → http://localhost:${PORT}\n`);
});
