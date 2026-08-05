// ResQNet map logic (extracted verbatim)
const TYPE_ICON = { flood: "🌊", fire: "🔥", accident: "🚗", medical: "🚑" };
    const TYPE_NAME = { flood: "Flood", fire: "Fire", accident: "Road accident", medical: "Medical emergency" };
    const SEV = { 1: "Low", 2: "Medium", 3: "High" };
    const RES = { water: "💧 Water", medical: "🩺 Medical", evacuation: "🚤 Evacuation", food: "🍞 Food" };

    // Sri Lanka
    const map = L.map("map", { zoomControl: true }).setView([7.3, 80.7], 8);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19,
    }).addTo(map);

    const markers = new Map(); // id -> marker

    function icon(status, sos) {
      const cls = sos && status !== "resolved" ? status + " sos" : status;
      const tag = sos && status !== "resolved" ? '<div class="tag">SOS</div>' : "";
      return L.divIcon({
        className: "",
        html: `<div class="pin-marker ${cls}">${tag}<div class="halo"></div><div class="core"></div></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });
    }

    function popup(i) {
      const when = new Date(i.created_at + "Z").toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
      return `
        <div class="pop-type">${i.sos ? "🆘 SOS — " : ""}${TYPE_ICON[i.type]} ${TYPE_NAME[i.type]}</div>
        <div class="pop-meta">${when} · ${i.is_guest ? "guest report" : "reported by " + i.reporter}</div>
        ${i.description ? `<div>${i.description.replace(/</g, "&lt;")}</div>` : ""}
        <div class="pop-badges">
          <span class="pop-badge ${i.status}">${i.status}</span>
          <span class="pop-badge sev">Severity: ${SEV[i.severity]}</span>
          ${i.resource ? `<span class="pop-badge res">${RES[i.resource]}</span>` : ""}
        </div>
        ${i.photo ? `<img src="/uploads/${i.photo}" alt="Incident photo"/>` : ""}
        <div style="margin-top:9px"><a href="/incident/${i.id}" style="color:#2DD4BF;font-weight:600">Open incident →</a></div>`;
    }

    let firstLoad = true;
    async function refresh() {
      try {
        const r = await fetch("/api/incidents");
        if (r.status === 401) { location.href = "/login"; return; }
        const { incidents } = await r.json();
        document.getElementById("count").textContent = incidents.length;

        const seen = new Set();
        for (const i of incidents) {
          seen.add(i.id);
          if (markers.has(i.id)) {
            markers.get(i.id).setIcon(icon(i.status, i.sos)).setPopupContent(popup(i));
          } else {
            const m = L.marker([i.lat, i.lng], { icon: icon(i.status, i.sos) }).addTo(map).bindPopup(popup(i));
            markers.set(i.id, m);
          }
        }
        for (const [id, m] of markers) if (!seen.has(id)) { map.removeLayer(m); markers.delete(id); }

        if (firstLoad && incidents.length) {
          map.fitBounds(incidents.map((i) => [i.lat, i.lng]), { padding: [60, 60], maxZoom: 13 });
          firstLoad = false;
        }
      } catch { /* offline blip — try again on next tick */ }
    }
    refresh();
    setInterval(refresh, 5000); // live: auto-refresh every 5 seconds

    // ---- Risk heatmap (admin only): historical incidents weighted by severity ----
    let heatLayer = null, heatOn = false;
    const heatBtn = document.getElementById("heatBtn");
    fetch("/api/me").then((r) => r.json()).then(({ user }) => {
      if (user) heatBtn.style.display = "inline-block";
    }).catch(() => {});

    async function loadHeat() {
      const { points } = await fetch("/api/heatmap").then((r) => r.json());
      if (heatLayer) map.removeLayer(heatLayer);
      // Radius scales with zoom so the glow stays large and visible at any level.
      const radiusForZoom = () => {
        const z = map.getZoom();
        return Math.max(45, Math.min(95, (z - 4) * 13)); // big but under clip threshold
      };
      heatLayer = L.heatLayer(points, {
        radius: radiusForZoom(), blur: 38, maxZoom: 18, max: 0.9, minOpacity: 0.35,
        gradient: { 0.25: "#2DD4BF", 0.45: "#F5A524", 0.65: "#E5484D", 0.85: "#8B0000" },
      }).addTo(map);
      map.off("zoomend", _heatZoom);
      map.on("zoomend", _heatZoom);
      // accuracy: show how many real incidents feed the heatmap
      const cnt = document.getElementById("heatCount");
      if (cnt) cnt.textContent = points.length
        ? `Based on ${points.length} reported incident${points.length > 1 ? "s" : ""} — the glow sits exactly where reports are.`
        : "No incidents reported yet.";
      return points.length;
    }
    function _heatZoom() {
      if (heatLayer && heatOn) {
        const z = map.getZoom();
        heatLayer.setOptions({ radius: Math.max(45, Math.min(95, (z - 4) * 13)) });
      }
    }
    heatBtn.addEventListener("click", async () => {
      heatOn = !heatOn;
      const legend = document.getElementById("heatLegend");
      if (heatOn) {
        await loadHeat();
        heatBtn.classList.add("on");
        if (legend) legend.style.display = "block";
      } else {
        if (heatLayer) { map.removeLayer(heatLayer); heatLayer = null; }
        heatBtn.classList.remove("on");
        if (legend) legend.style.display = "none";
      }
    });
