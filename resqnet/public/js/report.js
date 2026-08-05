// ResQNet — incident report page
(() => {
  const msg = document.getElementById("msg");
  const show = (errors) => {
    msg.innerHTML = errors.length === 1 ? errors[0]
      : "<ul>" + errors.map((e) => `<li>${e}</li>`).join("") + "</ul>";
    msg.classList.add("show");
    msg.scrollIntoView({ block: "nearest", behavior: "smooth" });
  };
  const clear = () => { msg.classList.remove("show"); msg.innerHTML = ""; };

  // ---- Card/chip selection ----
  const wire = (containerId, cls) => {
    const items = document.querySelectorAll(`#${containerId} .${cls}`);
    items.forEach((el) => el.addEventListener("click", () => {
      items.forEach((i) => i.classList.remove("on"));
      el.classList.add("on");
      el.querySelector("input").checked = true;
    }));
  };
  wire("typeGrid", "tcard");
  wire("resRow", "chip");

  // When a disaster type is chosen, reveal the supply-request box
  document.querySelectorAll("#typeGrid .tcard").forEach((el) => {
    el.addEventListener("click", () => {
      const box = document.getElementById("needBox");
      if (box && !box.classList.contains("show")) box.classList.add("show");
    });
  });

  // ---- GPS capture ----
  const gpsBox = document.getElementById("gpsBox");
  const gpsText = document.getElementById("gpsText");
  let lat = null, lng = null;

  function locate() {
    gpsBox.className = "gps";
    gpsText.textContent = "Getting your location…";
    if (!navigator.geolocation) {
      gpsBox.classList.add("fail");
      gpsText.textContent = "This browser doesn't support location.";
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
        gpsBox.classList.add("ok");
        gpsText.textContent =
          `Location locked — ${lat.toFixed(5)}, ${lng.toFixed(5)} (±${Math.round(pos.coords.accuracy)} m)`;
      },
      () => {
        gpsBox.classList.add("fail");
        gpsText.textContent = "Location blocked — allow access in your browser and retry.";
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }
  document.getElementById("gpsRetry").addEventListener("click", locate);
  locate();

  // ---- Photo preview ----
  const photoInput = document.getElementById("photo");
  const preview = document.getElementById("photoPreview");
  const photoText = document.getElementById("photoText");
  photoInput.addEventListener("change", () => {
    const f = photoInput.files[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { show(["Photo must be under 5 MB."]); photoInput.value = ""; return; }
    preview.src = URL.createObjectURL(f);
    preview.style.display = "block";
    photoText.textContent = "📷 " + f.name + " — tap to change";
  });
  // ---- Supply requests (quick chips + item/amount rows) ----
  const needsList = document.getElementById("needsList");
  const needHint = document.getElementById("needHint");
  const rowFor = (item) => Array.from(needsList.querySelectorAll(".needRow"))
    .find((r) => r.querySelector(".item").value.trim().toLowerCase() === item.toLowerCase());
  const addNeedRow = (item = "", qty = "", focusQty = false) => {
    const row = document.createElement("div");
    row.className = "needRow";
    row.innerHTML = `<input class="item" placeholder="Item (e.g. Water)" maxlength="40" value="${item.replace(/"/g,"&quot;")}">
      <input class="qty" placeholder="How many? (e.g. 50)" maxlength="20" value="${qty.replace(/"/g,"&quot;")}">
      <button type="button" class="rm" title="Remove">×</button>`;
    row.querySelector(".rm").addEventListener("click", () => {
      const it = row.querySelector(".item").value.trim();
      row.remove();
      // un-highlight matching chip
      document.querySelectorAll("#quickChips .qchip").forEach((c) => {
        if (c.dataset.item.toLowerCase() === it.toLowerCase()) c.classList.remove("on");
      });
      if (!needsList.children.length) needHint.style.display = "none";
    });
    needsList.appendChild(row);
    needHint.style.display = "block";
    if (focusQty) row.querySelector(".qty").focus();
  };
  // quick chips: tap to add/remove that item
  document.querySelectorAll("#quickChips .qchip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const item = chip.dataset.item;
      const isOther = chip.textContent.includes("Other");
      if (isOther) { addNeedRow("", "", false); needsList.lastChild.querySelector(".item").focus(); return; }
      const existing = rowFor(item);
      if (existing) { existing.remove(); chip.classList.remove("on"); if (!needsList.children.length) needHint.style.display = "none"; }
      else { addNeedRow(item, "", true); chip.classList.add("on"); }
    });
  });

  // ---- Submit ----
  const form = document.getElementById("reportForm");
  const btn = document.getElementById("submitBtn");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clear();

    const type = form.querySelector("input[name=type]:checked");
    const errors = [];
    if (!type) errors.push("Choose an emergency type.");
    if (lat === null) errors.push("Location is missing — allow location access and retry.");
    if (errors.length) return show(errors);

    const fd = new FormData();
    fd.append("type", type.value);
    fd.append("description", document.getElementById("description").value);
    fd.append("lat", lat);
    fd.append("lng", lng);
    const res = form.querySelector("input[name=resource]:checked");
    if (res) fd.append("resource", res.value);
    // collect resource needs (item + qty rows)
    const needs = [];
    document.querySelectorAll("#needsList .needRow").forEach((row) => {
      const item = row.querySelector(".item").value.trim();
      const qty = row.querySelector(".qty").value.trim();
      if (item) needs.push({ item, qty });
    });
    if (needs.length) fd.append("needs", JSON.stringify(needs));
    if (photoInput.files[0]) fd.append("photo", photoInput.files[0]);

    btn.disabled = true; btn.textContent = "Sending…";
    try {
      const r = await fetch("/api/incidents", { method: "POST", body: fd });
      const data = await r.json();
      if (data.ok) {
        btn.textContent = "✓ Report sent";
        setTimeout(() => (location.href = data.redirect || "/map"), 600);
        return;
      }
      show(data.errors || ["Something went wrong. Try again."]);
    } catch {
      show(["Could not reach the server."]);
    }
    btn.disabled = false; btn.textContent = "Send report";
  });
})();
