// ResQNet — client-side auth handling (login + register)
(() => {
  const msg = document.getElementById("msg");

  function showErrors(errors) {
    if (!msg) return;
    msg.innerHTML = errors.length === 1
      ? errors[0]
      : "<ul>" + errors.map((e) => `<li>${e}</li>`).join("") + "</ul>";
    msg.classList.add("show");
    msg.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }
  function clearErrors() { if (msg) { msg.classList.remove("show"); msg.innerHTML = ""; } }

  async function submit(url, payload, btn) {
    clearErrors();
    btn.disabled = true;
    const original = btn.textContent;
    btn.textContent = "Please wait…";
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.ok) { location.href = data.redirect; return; }
      showErrors(data.errors || ["Something went wrong. Try again."]);
    } catch {
      showErrors(["Could not reach the server. Is it running?"]);
    }
    btn.disabled = false;
    btn.textContent = original;
  }

  // ---- Login ----
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      submit("/api/login", {
        email: loginForm.email.value,
        password: loginForm.password.value,
      }, document.getElementById("submitBtn"));
    });
  }

  // ---- Register ----
  const regForm = document.getElementById("registerForm");
  if (regForm) {
    // Populate districts
    const DISTRICTS = ["Ampara","Anuradhapura","Badulla","Batticaloa","Colombo","Galle","Gampaha","Hambantota","Jaffna","Kalutara","Kandy","Kegalle","Kilinochchi","Kurunegala","Mannar","Matale","Matara","Monaragala","Mullaitivu","Nuwara Eliya","Polonnaruwa","Puttalam","Ratnapura","Trincomalee","Vavuniya"];
    const districtSel = document.getElementById("district");
    DISTRICTS.forEach((d) => {
      const o = document.createElement("option");
      o.value = d; o.textContent = d;
      districtSel.appendChild(o);
    });

    // Role card toggle
    const cards = document.querySelectorAll(".role");
    const volExtras = document.getElementById("volExtras");
    cards.forEach((card) => {
      card.addEventListener("click", () => {
        cards.forEach((c) => c.classList.remove("on"));
        card.classList.add("on");
        card.querySelector("input").checked = true;
        volExtras.classList.toggle("show", card.dataset.role === "volunteer");
      });
    });

    regForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const role = regForm.querySelector("input[name=role]:checked").value;
      const skills = [...regForm.querySelectorAll("input[name=skills]:checked")].map((c) => c.value);
      submit("/api/register", {
        full_name: regForm.full_name.value,
        email: regForm.email.value,
        phone: regForm.phone.value.replace(/\s+/g, ""),
        password: regForm.password.value,
        confirm: regForm.confirm.value,
        role,
        skills,
        district: districtSel.value,
      }, document.getElementById("submitBtn"));
    });
  }
})();
