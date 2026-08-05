// Global toast helper — small, dependency-free feedback messages.
window.toast = function (msg, kind) {
  let el = document.getElementById("__toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "__toast";
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.className = "toast show" + (kind ? " " + kind : "");
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.className = "toast" + (kind ? " " + kind : ""); }, 2600);
};
