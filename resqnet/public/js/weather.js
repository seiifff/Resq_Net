// ResQNet — live weather widget (Open-Meteo, free, no API key)
// Falls back silently to the static values in the HTML if offline.
(async () => {
  const ICONS = (c) => {
    if ([0].includes(c)) return ["☀️", "Sunny"];
    if ([1, 2].includes(c)) return ["⛅", "Partly cloudy"];
    if ([3].includes(c)) return ["☁️", "Cloudy"];
    if ([45, 48].includes(c)) return ["🌫️", "Foggy"];
    if ([51, 53, 55, 61, 63, 80, 81].includes(c)) return ["🌧️", "Rain showers"];
    if ([65, 82].includes(c)) return ["🌧️", "Heavy rain"];
    if ([95, 96, 99].includes(c)) return ["⛈️", "Thundershowers"];
    return ["🌥️", "Overcast"];
  };
  try {
    const url = "https://api.open-meteo.com/v1/forecast?latitude=6.93&longitude=79.85"
      + "&current=temperature_2m,weather_code"
      + "&hourly=temperature_2m"
      + "&daily=weather_code,temperature_2m_max,temperature_2m_min"
      + "&timezone=Asia%2FColombo&forecast_days=5";
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return;
    const d = await res.json();

    // Current
    const [icon, cond] = ICONS(d.current.weather_code);
    document.getElementById("wTemp").textContent = Math.round(d.current.temperature_2m);
    document.getElementById("wIcon").textContent = icon;
    document.getElementById("wCond").textContent = cond;
    document.getElementById("wWhen").textContent =
      new Date().toLocaleDateString("en-GB", { weekday: "long" }) + " – Today";

    // Sparkline: today 6am → 9pm (indexes 6..21)
    const temps = d.hourly.temperature_2m.slice(6, 22);
    const min = Math.min(...temps), max = Math.max(...temps), span = (max - min) || 1;
    const pts = temps.map((t, i) =>
      `${(i / (temps.length - 1)) * 280},${38 - ((t - min) / span) * 30}`).join(" ");
    document.getElementById("wSpark").setAttribute("points", pts);
    document.getElementById("wTimes").innerHTML =
      ["6am","10am","1pm","5pm","9pm"].map((t) => `<span>${t}</span>`).join("");

    // 5-day
    document.getElementById("wDays").innerHTML = d.daily.time.map((day, i) => {
      const [di] = ICONS(d.daily.weather_code[i]);
      const name = new Date(day).toLocaleDateString("en-GB", { weekday: "short" });
      return `<div class="day"><div class="d">${name}</div><div class="i">${di}</div>
        <div class="t">${Math.round(d.daily.temperature_2m_max[i])}° ${Math.round(d.daily.temperature_2m_min[i])}°</div></div>`;
    }).join("");

    // ---- Weather-risk alert -------------------------------------------
    // If today or tomorrow's forecast is heavy rain or thunderstorms, warn
    // citizens of possible flood risk. Uses the real Open-Meteo codes above —
    // no separate service, no hardcoded weather.
    const HEAVY = [65, 82, 95, 96, 99]; // heavy rain / thundershowers
    const RAIN = [63, 81];              // moderate rain
    const banner = document.getElementById("weatherAlert");
    if (banner) {
      const codes = (d.daily.weather_code || []).slice(0, 2); // today + tomorrow
      if (codes.some((c) => HEAVY.includes(c))) {
        banner.className = "weather-alert severe show";
        banner.innerHTML = `<span class="wa-ic">⛈️</span><div><b>Flood-risk warning</b> — heavy rain or storms forecast for your area in the next 24–48 hours. Stay alert, avoid low-lying areas, and keep emergency numbers handy (117 · 1990).</div>`;
      } else if (codes.some((c) => RAIN.includes(c))) {
        banner.className = "weather-alert watch show";
        banner.innerHTML = `<span class="wa-ic">🌧️</span><div><b>Weather watch</b> — significant rain expected soon. Stay aware of conditions in your area.</div>`;
      }
    }
  } catch { /* offline — static fallback stays */ }
})();
