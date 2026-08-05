// ResQNet dashboard — role-focused. Each role sees only its own view.
(async () => {
  const meRes = await fetch("/api/me");
  if (!meRes.ok) { location.href = "/login"; return; }
  const { user } = await meRes.json();

  const NAME = { flood: "🌊 Flood", fire: "🔥 Fire", accident: "🚗 Accident", medical: "🚑 Medical" };
  const SEV = { 1: "Low", 2: "Med", 3: "HIGH" };
  const $ = (id) => document.getElementById(id);

  // Prominent Trust Score card with a ring gauge, backed by REAL history:
  // it fetches the user's actual genuine/false report counts so the number is
  // provably tied to events, not a static badge.
  function trustCard(score, role) {
    const s = Math.max(0, Math.min(100, score));
    const state = s >= 70 ? "high" : s >= 40 ? "mid" : "low";
    const label = s >= 70 ? "Trusted" : s >= 40 ? "Building" : "Low";
    const col = s >= 70 ? "#2DD4BF" : s >= 40 ? "#F5A524" : "#E5484D";
    const circ = 2 * Math.PI * 27;
    const off = circ - (s / 100) * circ;
    const desc = role === "citizen"
      ? "This is how ResQNet checks that reports are genuine. Accurate reports raise your score; false reports lower it — so responders know real emergencies from fake ones."
      : "Your reliability on the network. Genuine responses keep it high; it helps organisations trust the reports and responders they act on.";
    return `<div class="trustcard">
      <div class="ring">
        <svg width="64" height="64" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="27" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="6"/>
          <circle cx="32" cy="32" r="27" fill="none" stroke="${col}" stroke-width="6" stroke-linecap="round"
            stroke-dasharray="${circ.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}"/>
        </svg>
        <span class="val">${s}</span>
      </div>
      <div class="tinfo">
        <div class="tlabel">Community Trust Score</div>
        <div class="ttitle">Is this report real?</div>
        <div class="tdesc">${desc}</div>
        <div class="tstats" id="tStats"><span class="tstat-load">Loading history…</span></div>
      </div>
      <span class="tstate ${state}">${label}</span>
    </div>`;
  }

  // fetch and render the real history under whichever trust card is shown
  async function loadTrustHistory() {
    try {
      const t = await fetch("/api/me/trust").then((r) => r.json());
      if (!t.ok) return;
      const el = document.getElementById("tStats");
      if (!el) return;
      const since = t.member_since ? new Date(t.member_since + "Z").toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : "";
      if (!t.total) {
        el.innerHTML = `<span class="tstat neutral">No reports yet — your score starts at 100 and moves with your first verified report.</span>`;
        return;
      }
      el.innerHTML =
        `<span class="tstat good">✓ ${t.genuine} verified genuine</span>` +
        (t.false_reports ? `<span class="tstat bad">✗ ${t.false_reports} false</span>` : `<span class="tstat neutral">0 false</span>`) +
        `<span class="tstat neutral">${t.total} report${t.total>1?"s":""} total</span>` +
        (since ? `<span class="tstat neutral">since ${since}</span>` : "");
    } catch {}
  }

  // header
  $("welcome").textContent = "Hi, " + user.full_name.split(" ")[0];
  const rb = $("roleBadge");
  rb.textContent = user.role;
  rb.className = "badge " + user.role;
  $("tickRight").textContent = user.role === "admin" ? "Organisation" : user.role === "volunteer" ? "Volunteer" : "Citizen";

  const subText = {
    citizen: "Report an emergency or check the live map.",
    volunteer: "Here are the emergencies you can help with.",
    admin: "Coordinate the network from your command tools.",
  };
  $("sub").textContent = subText[user.role] || "";

  $("logoutBtn").addEventListener("click", async () => {
    await fetch("/api/logout", { method: "POST" });
    location.href = "/login";
  });

  // ---------- broadcast banner (all roles) ----------
  (async () => {
    try {
      const { broadcast: b } = await fetch("/api/broadcasts/latest").then((r) => r.json());
      if (b) {
        $("bcBody").textContent = b.body;
        $("bcMeta").textContent = (b.district === "ALL" ? "All districts" : b.district) + " · " +
          new Date(b.created_at + "Z").toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
        $("bcBanner").style.display = "block";
      }
    } catch {}
  })();

  // ==================================================== CITIZEN ====
  if (user.role === "citizen") {
    $("citizenView").style.display = "block";
    $("citTrust").innerHTML = trustCard(user.trust_score, "citizen"); loadTrustHistory();

    // SOS
    const sosBtn = $("sosBtn");
    sosBtn.addEventListener("click", () => {
      $("sosMsg").innerHTML = `<div style="background:#fff;border:1px solid #E4B4AD;border-radius:8px;padding:12px 14px;margin-top:10px;font-size:13.5px;color:#111">
        Send an SOS with your current location to every nearby volunteer?
        <div style="display:flex;gap:9px;margin-top:10px">
          <button class="btn btn-red" id="sosYes" style="width:auto;padding:8px 16px;font-size:13px">Yes, send SOS</button>
          <button class="btn btn-line" id="sosNo" style="width:auto;padding:8px 16px;font-size:13px">Cancel</button>
        </div></div>`;
      $("sosNo").onclick = () => ($("sosMsg").innerHTML = "");
      $("sosYes").onclick = () => {
        if (!navigator.geolocation) { alert("Location not available. Call 117."); return; }
        navigator.geolocation.getCurrentPosition(async (p) => {
          const r = await fetch("/api/sos", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lat: p.coords.latitude, lng: p.coords.longitude }),
          });
          const d = await r.json();
          if (d.ok) location.href = "/incident/" + d.id;
          else $("sosMsg").innerHTML = `<p style="color:var(--red);font-size:13px;margin-top:8px">${(d.errors || ["Try again"])[0]}</p>`;
        }, () => alert("Allow location to send SOS, or call 117."), { enableHighAccuracy: true });
      };
    });

    // my reports
    try {
      const { incidents } = await fetch("/api/incidents/mine").then((r) => r.json());
      if (incidents && incidents.length) {
        $("myReportsList").innerHTML = incidents.map((i) => {
          const when = new Date(i.created_at + "Z").toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
          const cls = i.status === "resolved" ? "citizen" : i.status === "responding" ? "volunteer" : "admin";
          return `<a href="/incident/${i.id}" style="display:flex;gap:12px;align-items:center;padding:12px 0;border-bottom:1px solid var(--rule);font-size:13.5px;text-decoration:none;color:inherit">
            <strong style="min-width:105px">${NAME[i.type]}</strong>
            <span style="color:var(--muted);flex:1">${when}</span>
            <span class="badge ${cls}">${i.status}</span></a>`;
        }).join("");
        $("myReports").style.display = "block";
      }
    } catch {}
  }

  // ================================================== VOLUNTEER ====
  if (user.role === "volunteer") {
    $("volunteerView").style.display = "block";
    $("volTrust").innerHTML = trustCard(user.trust_score, "volunteer"); loadTrustHistory();

    const row = (i, cta) => {
      const when = new Date(i.created_at + "Z").toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
      let needCount = 0;
      try { const n = JSON.parse(i.needs || "[]"); needCount = Array.isArray(n) ? n.length : 0; } catch {}
      return `<div style="display:flex;align-items:center;gap:11px;padding:12px 0;border-bottom:1px solid var(--rule);font-size:13.5px;flex-wrap:wrap">
        <strong style="min-width:95px">${NAME[i.type]}</strong>
        <span style="color:var(--muted)">${when}</span>
        ${i.sos ? '<span class="badge admin" style="background:var(--red-bg)">🆘 SOS</span>' : ""}
        ${i.escalated && !i.sos ? '<span class="badge admin">urgent</span>' : ""}
        ${needCount ? `<span class="badge" style="background:var(--amber-bg);color:var(--amber);border:1px solid var(--amber)">📦 ${needCount} suppl${needCount>1?"ies":"y"} needed</span>` : ""}
        <span style="flex:1"></span>
        <a class="btn ${cta === "Respond" ? "btn-red" : "btn-line"}" style="width:auto;padding:7px 16px;font-size:12.5px" href="/incident/${i.id}">${cta}</a>
      </div>`;
    };

    async function loadVol() {
      try {
        const r = await fetch("/api/alerts");
        if (!r.ok) return;
        const { matched, other, active_response } = await r.json();

        if (active_response) {
          $("volActiveBody").innerHTML = row(active_response, "Open");
          $("volActive").style.display = "block";
        } else { $("volActive").style.display = "none"; }

        $("volAlertsList").innerHTML = matched.length
          ? matched.map((i) => row(i, "Respond")).join("")
          : '<p class="empty">No emergencies match your skills right now. We\'ll alert you when one comes in.</p>';

        if (other && other.length) {
          $("volOtherList").innerHTML = other.map((i) => row(i, "View")).join("");
          $("volOther").style.display = "block";
        } else { $("volOther").style.display = "none"; }

        const h = await fetch("/api/responses/mine").then((x) => x.json());
        if (h.responses && h.responses.length) {
          $("volHistoryList").innerHTML = h.responses.map((i) => {
            const when = new Date(i.created_at + "Z").toLocaleDateString("en-GB", { day: "numeric", month: "short" });
            const outcome = i.status !== "resolved" ? i.status : (i.false_report ? "false report" : "resolved ✓");
            const cls = i.status === "resolved" && !i.false_report ? "citizen" : i.status === "responding" ? "volunteer" : "admin";
            return `<a href="/incident/${i.id}" style="display:flex;gap:12px;align-items:center;padding:11px 0;border-bottom:1px solid var(--rule);font-size:13.5px;text-decoration:none;color:inherit">
              <strong style="min-width:95px">${NAME[i.type]}</strong>
              <span style="color:var(--muted);flex:1">${when}</span>
              <span class="badge ${cls}">${outcome}</span></a>`;
          }).join("");
          $("volHistory").style.display = "block";
        }
      } catch {}
    }
    loadVol();
    setInterval(loadVol, 5000);

    // browser notifications for new matched alerts
    (function initNotifications() {
      let known = new Set(), primed = false;
      async function poll() {
        try {
          const r = await fetch("/api/alerts");
          if (!r.ok) return;
          const { matched } = await r.json();
          const ids = (matched || []).map((i) => i.id);
          if (primed && "Notification" in window && Notification.permission === "granted") {
            ids.filter((id) => !known.has(id)).forEach((id) => {
              const inc = (matched || []).find((x) => x.id === id);
              if (inc) new Notification("ResQNet — alert near you", { body: (inc.sos ? "SOS · " : "") + (inc.type || "incident") + " reported nearby", tag: "resqnet-" + id });
            });
          }
          known = new Set(ids); primed = true;
        } catch {}
      }
      if ("Notification" in window && Notification.permission === "default") {
        document.addEventListener("click", () => { if (Notification.permission === "default") Notification.requestPermission(); }, { once: true });
      }
      poll(); setInterval(poll, 15000);
    })();
  }

  // ====================================================== ADMIN ====
  if (user.role === "admin") {
    $("adminView").style.display = "block";
  }
})();
