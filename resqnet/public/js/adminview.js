// ResQNet admin logic (extracted)
const NAME = { flood: "🌊 Flood", fire: "🔥 Fire", accident: "🚗 Accident", medical: "🚑 Medical" };
    const RES = { water: "💧 water", medical: "🩺 medical", evacuation: "🚤 evacuation", food: "🍞 food" };
    const badge = (s) => `<span class="badge ${s === "resolved" ? "citizen" : s === "responding" ? "volunteer" : "admin"}">${s}</span>`;

    async function load() {
      const r = await fetch("/api/admin/stats");
      if (r.status === 403 || r.status === 401) { location.href = "/dashboard"; return; }
      const d = await r.json();

      const countUp=(id,val)=>{const el=document.getElementById(id);if(!el)return;const end=+val||0;const cur=parseInt(el.textContent)||0;if(cur===end){el.textContent=end;return;}const step=Math.max(1,Math.ceil(Math.abs(end-cur)/12));let n=cur;const t=setInterval(()=>{n+=(end>n?step:-step);if((step>0&&n>=end)||(end===n)){n=end;clearInterval(t);}el.textContent=n;},28);};
      countUp("kTotal",d.kpi.total);
      countUp("kActive",d.kpi.active);
      countUp("kResp",d.kpi.responding);
      countUp("kRes",d.kpi.resolved);
      countUp("kSos",d.kpi.sos_open);
      document.getElementById("kAvgR").textContent =
        d.times.avg_response_min != null ? Math.round(d.times.avg_response_min) + "m" : "—";

      if (d.resources.length) {
        const max = d.resources[0].n;
        document.getElementById("resList").innerHTML = d.resources.map((x) => `
          <div class="rowline"><span class="n">${x.n}×</span>
            <span style="min-width:110px">${RES[x.resource]}</span>
            <span style="min-width:110px;color:var(--ink-2)">${x.district}</span>
            <span class="bar"><i style="width:${(x.n / max) * 100}%"></i></span></div>`).join("");
      }

      if (d.hotspots.length) {
        const max = d.hotspots[0].n;
        document.getElementById("hotList").innerHTML = d.hotspots.map((x) => `
          <div class="rowline"><span class="n">${x.n}</span>
            <span style="min-width:130px">${x.district}</span>
            <span style="color:var(--muted);font-size:12px;min-width:64px">${x.active} active</span>
            <span class="bar"><i style="width:${(x.n / max) * 100}%"></i></span></div>`).join("");
      }

      // Aggregated supply needs with amounts — visual panel
      if (d.needs && d.needs.length) {
        const ICON = (item) => {
          const s = item.toLowerCase();
          if (s.includes("water")) return "💧";
          if (s.includes("food") || s.includes("meal") || s.includes("bread")) return "🍞";
          if (s.includes("medic") || s.includes("first aid") || s.includes("kit")) return "🩺";
          if (s.includes("blanket") || s.includes("cloth") || s.includes("tent") || s.includes("shelter")) return "🛏️";
          if (s.includes("boat") || s.includes("rescue") || s.includes("evac")) return "🚤";
          if (s.includes("fuel") || s.includes("power") || s.includes("gener")) return "⚡";
          return "📦";
        };
        const maxQ = Math.max(...d.needs.map((x) => x.hasNum ? x.qty : x.count), 1);
        document.getElementById("needsList").innerHTML = d.needs.map((x) => {
          const val = x.hasNum ? x.qty : x.count;
          return `
          <div style="display:flex;align-items:center;gap:14px;padding:13px 0;border-bottom:1px solid var(--rule)">
            <span style="font-size:22px;width:30px;text-align:center">${ICON(x.item)}</span>
            <span style="min-width:64px;font-family:var(--serif);font-weight:700;font-size:20px;color:var(--amber)">${x.hasNum ? x.qty : x.count + "×"}</span>
            <span style="min-width:150px;font-weight:600">${(x.item||"").replace(/</g,"&lt;")}</span>
            <span style="min-width:100px;color:var(--ink-2)">📍 ${x.district}</span>
            <span style="flex:1;height:8px;border-radius:4px;background:var(--rule);overflow:hidden;min-width:60px"><i style="display:block;height:100%;width:${(val/maxQ)*100}%;background:linear-gradient(90deg,var(--amber),var(--red));border-radius:4px"></i></span>
            <span style="color:var(--muted);font-size:12px;min-width:64px;text-align:right">${x.count} report${x.count>1?"s":""}</span>
          </div>`;
        }).join("");
      } else {
        document.getElementById("needsList").innerHTML = '<p style="color:var(--muted);font-size:13.5px">No specific supply requests yet.</p>';
      }

      const PRI = { critical: ["var(--red)", "var(--red-bg)"], high: ["var(--amber)", "var(--amber-bg)"],
                    medium: ["var(--green)", "var(--green-bg)"], low: ["var(--muted)", "var(--paper)"] };
      const deploy = (d.recommendations || []).filter((r) => r.priority !== "low");
      if (deploy.length)
        document.getElementById("depList").innerHTML = deploy.map((r) => {
          const [fg, bg] = PRI[r.priority];
          const action = r.gap > 0
            ? `Deploy <b>${r.gap}</b> more responder${r.gap > 1 ? "s" : ""} to <b>${r.district}</b>`
            : `<b>${r.district}</b> — monitor, local volunteers appear sufficient`;
          return `<div class="rowline">
            <span class="badge admin" style="background:${bg};color:${fg};border-color:${bg};min-width:74px;text-align:center">${r.priority}</span>
            <span style="flex:1;min-width:180px">${action}</span>
            <span style="color:var(--muted);font-size:12.5px">${r.reason}</span>
            <span style="color:var(--faint);font-size:12px">${r.available} available · ${r.needed} needed</span>
          </div>`;
        }).join("");

      if (d.volunteers.length)
        document.getElementById("volList").innerHTML = d.volunteers.map((v) => `
          <div class="rowline"><span class="n">${v.responses}</span>
            <span style="flex:1">${v.full_name}</span>
            <span style="color:var(--muted);font-size:12.5px">${v.resolved} resolved</span></div>`).join("");

      document.getElementById("recentList").innerHTML = d.recent.map((i) => {
        const when = new Date(i.created_at + "Z").toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
        return `<a class="rowline" href="/incident/${i.id}" style="text-decoration:none">
          <strong style="min-width:105px">${NAME[i.type]}</strong>
          <span style="min-width:105px;color:var(--ink-2)">${i.district || "—"}</span>
          <span style="color:var(--faint);font-size:12.5px">${when}</span>
          ${i.sos && i.status !== "resolved" ? '<span class="badge admin" style="background:var(--red-bg)">🆘</span>' : ""}
          ${i.escalated && !i.sos && i.status !== "resolved" ? '<span class="badge admin">ESC</span>' : ""}
          ${i.resource ? `<span style="font-size:12px;color:var(--ink-2)">${RES[i.resource]}</span>` : ""}
          <span style="flex:1"></span>${badge(i.status)}</a>`;
      }).join("");

      if(window.drawCharts) window.drawCharts(d);
      const sel = document.getElementById("bDistrict");
      if (sel.options.length === 1)
        d.districts.forEach((x) => { const o = document.createElement("option"); o.value = o.textContent = x; sel.appendChild(o); });
    }

    document.getElementById("bSend").addEventListener("click", async () => {
      const bMsg = document.getElementById("bMsg"), bOk = document.getElementById("bOk");
      bMsg.classList.remove("show"); bOk.classList.remove("show");
      const r = await fetch("/api/admin/broadcast", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ district: document.getElementById("bDistrict").value, body: document.getElementById("bBody").value }),
      });
      const d = await r.json();
      if (d.ok) { bOk.textContent = "Broadcast sent — citizens will see it on their dashboard."; bOk.classList.add("show"); document.getElementById("bBody").value = ""; }
      else { bMsg.textContent = (d.errors || ["Failed."]).join(" "); bMsg.classList.add("show"); }
    });

    load();
    setInterval(load, 10000);
