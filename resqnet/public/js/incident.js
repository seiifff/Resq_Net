// ResQNet — incident detail + two-way chat
(() => {
  const id = location.pathname.split("/").pop();
  const NAME = { flood: "🌊 Flood", fire: "🔥 Fire", accident: "🚗 Road accident", medical: "🚑 Medical emergency" };
  const SEV = { 1: "Low", 2: "Medium", 3: "High" };
  const RES = { water: "💧 Water", medical: "🩺 Medical", evacuation: "🚤 Evacuation", food: "🍞 Food" };
  const badgeCls = { active: "admin", responding: "volunteer", resolved: "citizen" };

  let viewer = null, incident = null;

  const api = async (url, opts) => {
    const r = await fetch(url, opts);
    const d = await r.json().catch(() => ({}));
    if (!d.ok && d.errors) alert(d.errors.join("\n"));
    return d;
  };

  async function load() {
    const d = await api(`/api/incidents/${id}`);
    if (!d.ok) { location.href = "/dashboard"; return; }
    incident = d.incident; viewer = d.viewer;
    render();
  }

  function render() {
    const i = incident;
    document.getElementById("title").textContent = (i.sos ? "🆘 SOS — " : "") + NAME[i.type];
    const b = document.getElementById("statusBadge");
    b.textContent = i.status + (i.escalated && i.status !== "resolved" ? " · ESCALATED" : "");
    b.className = "badge " + badgeCls[i.status];

    const when = new Date(i.created_at + "Z").toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
    document.getElementById("meta").textContent =
      `${when} · ` +
      (i.is_guest ? "guest report (no account)" : `reported by ${i.reporter} (trust ${i.reporter_trust})`) +
      (i.responder ? ` · responder: ${i.responder}` : "");
    document.getElementById("desc").textContent = i.description || "";

    // Guest callback number (visible to the responding volunteer / admin)
    document.getElementById("guestCall")?.remove();
    if (i.is_guest && i.guest_phone) {
      const call = document.createElement("div");
      call.id = "guestCall";
      call.style.cssText = "margin:10px 0;padding:11px 14px;border:1px solid var(--amber);background:var(--amber-bg);border-radius:8px;font-size:13.5px";
      call.innerHTML = `📞 Guest callback number: <a href="tel:${i.guest_phone}" style="color:var(--amber);font-weight:600">${i.guest_phone}</a>`;
      document.getElementById("desc").after(call);
    }

    document.getElementById("kv").innerHTML =
      `<span class="badge admin" style="background:var(--paper);color:var(--ink-2);border-color:var(--rule-2)">Severity: ${SEV[i.severity]}</span>` +
      (i.resource ? `<span class="badge citizen">${RES[i.resource]}</span>` : "") +
      (i.false_report ? `<span class="badge admin">FALSE REPORT</span>` : "");

    // Resource needs with amounts
    document.getElementById("needsBox")?.remove();
    if (i.needs) {
      let list; try { list = JSON.parse(i.needs); } catch { list = null; }
      if (list && list.length) {
        const box = document.createElement("div");
        box.id = "needsBox";
        box.style.cssText = "margin:12px 0;padding:12px 15px;border:1px solid var(--rule-2);background:var(--card);border-radius:10px";
        box.innerHTML = `<div style="font-family:var(--mono);font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--amber);margin-bottom:8px">📦 Supplies needed</div>` +
          list.map((n) => `<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid var(--rule);font-size:13.5px"><span>${(n.item||"").replace(/</g,"&lt;")}</span><strong>${(n.qty||"—").replace(/</g,"&lt;")}</strong></div>`).join("");
        document.getElementById("kv").after(box);
      }
    }

    if (i.photo) {
      const ph = document.getElementById("photo");
      ph.src = "/uploads/" + i.photo; ph.style.display = "block";
    }

    // ---- Actions per role/state ----
    const a = document.getElementById("actions");
    a.innerHTML = "";
    const mk = (cls, label, fn) => {
      const btn = document.createElement("button");
      btn.className = "btn " + cls; btn.textContent = label;
      btn.addEventListener("click", fn); return btn;
    };

    if (i.status === "active" && ["volunteer", "admin"].includes(viewer.role)) {
      a.appendChild(mk("btn-amber", "🛟 I'm responding", async () => {
        if ((await api(`/api/incidents/${id}/respond`, { method: "POST" })).ok) { window.toast&&toast("You're now responding to this incident","ok"); load(); }
      }));
    }

    if (i.status === "responding" && (viewer.is_responder || viewer.role === "admin")) {
      // Check-in countdown
      const last = new Date((i.last_checkin || i.responded_at) + "Z").getTime();
      const cd = document.createElement("div");
      cd.className = "countdown";
      const tick = () => {
        const leftMs = last + 15 * 60 * 1000 - Date.now();
        const m = Math.max(0, Math.floor(leftMs / 60000)), s = Math.max(0, Math.floor((leftMs % 60000) / 1000));
        cd.innerHTML = leftMs > 0
          ? `Next check-in due in <b>${m}m ${String(s).padStart(2, "0")}s</b> — go silent and this alert escalates to the next volunteer.`
          : `<b>Check-in overdue</b> — this incident may be released to other volunteers.`;
      };
      tick(); setInterval(tick, 1000);
      a.appendChild(cd);

      if (viewer.is_responder) {
        a.appendChild(mk("btn-amber", "📍 Check in", async () => {
          if ((await api(`/api/incidents/${id}/checkin`, { method: "POST" })).ok) { window.toast&&toast("Checked in — status updated","ok"); load(); }
        }));
      }
      const row = document.createElement("div"); row.className = "row";
      row.appendChild(mk("btn-teal", "✓ Resolve — genuine report", async () => {
        if ((await api(`/api/incidents/${id}/resolve`, {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ genuine: true }),
        })).ok) { window.toast&&toast("Incident resolved — thank you","ok"); load(); }
      }));
      row.appendChild(mk("btn-danger-ghost", "Resolve — false report", async () => {
        if (!confirm("Mark this as a FALSE report? The reporter's trust score will drop by 25.")) return;
        if ((await api(`/api/incidents/${id}/resolve`, {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ genuine: false }),
        })).ok) { window.toast&&toast("Marked as false report","ok"); load(); }
      }));
      a.appendChild(row);
    }

    if (i.status === "resolved") {
      const done = document.createElement("div");
      done.className = "countdown";
      done.innerHTML = (i.false_report
        ? "Closed as a false report. Reporter's trust score reduced by 25."
        : "Resolved. Reporter's trust score increased by 10. ✓") +
        ` &nbsp;·&nbsp; <a href="/api/incidents/${i.id}/report" target="_blank" style="color:var(--response);font-weight:600">📄 Post-incident report</a>`;
      a.appendChild(done);
    }

    // Chat input visibility
    document.getElementById("chatForm").style.display = viewer.can_chat ? "flex" : "none";
    if (!viewer.can_chat)
      document.getElementById("chatLog").innerHTML =
        '<div class="chat-empty">Chat is between the reporter, the responder and admins.</div>';
  }

  // ---- Chat: poll every 4 s ----
  const log = document.getElementById("chatLog");
  async function loadChat() {
    if (!viewer || !viewer.can_chat) return;
    const r = await fetch(`/api/incidents/${id}/messages`);
    if (!r.ok) return;
    const { messages } = await r.json();
    const atBottom = log.scrollHeight - log.scrollTop - log.clientHeight < 60;
    log.innerHTML = messages.length
      ? messages.map((m) => {
          const t = m.created_at ? new Date(m.created_at + "Z").toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : "";
          return `
          <div class="bubble ${m.sender_id === viewer.id ? "me" : "them"}">
            <div class="who">${m.sender} · ${m.sender_role}</div>${m.body.replace(/</g, "&lt;")}
            ${t ? `<div class="time">${t}</div>` : ""}
          </div>`;
        }).join("")
      : '<div class="chat-empty">No messages yet — say something to coordinate the response.</div>';
    if (atBottom) log.scrollTop = log.scrollHeight;
  }

  document.getElementById("chatForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const inp = document.getElementById("chatBody");
    const body = inp.value.trim();
    if (!body) return;
    inp.value = "";
    await fetch(`/api/incidents/${id}/messages`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body }),
    });
    loadChat();
  });

  load().then(loadChat);
  setInterval(loadChat, 4000);
  setInterval(load, 15000); // refresh status/actions periodically
})();
