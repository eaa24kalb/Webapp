// Fetches lunar/solar data for the Moon Calendar.

import SunCalc from "suncalc";

// read configuration from .env (with fallback defaults)
const OPEN_METEO_URL =
  import.meta.env.VITE_OPEN_METEO_URL || "https://api.open-meteo.com/v1/astronomy";
const DEFAULT_LAT = Number(import.meta.env.VITE_DEFAULT_LAT ?? 55.68);
const DEFAULT_LON = Number(import.meta.env.VITE_DEFAULT_LON ?? 12.57);


// weekday label for YYYY-MM-DD 
function weekdayName(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { weekday: "short" });
}

// Map Open-Meteo/SunCalc phase (0..1) → label used in UI
function phaseNameFromIllum(phase) {
  if (phase == null) return "Unknown";
  const p = ((phase % 1) + 1) % 1;
  if (p < 0.03 || p > 0.97) return "New Moon";
  if (p < 0.22) return "Waxing Crescent";
  if (p < 0.28) return "First Quarter";
  if (p < 0.47) return "Waxing Gibbous";
  if (p < 0.53) return "Full Moon";
  if (p < 0.72) return "Waning Gibbous";
  if (p < 0.78) return "Last Quarter";
  return "Waning Crescent";
}

// Approximate moon age in days from normalized phase (0..1)
function approxMoonAgeFromPhase(phase) {
  return Math.round((phase || 0) * 29.530588853 * 10) / 10;
}

const MOCK_ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

function mockZodiacForDay(index) {
  return MOCK_ZODIAC_SIGNS[index % MOCK_ZODIAC_SIGNS.length];
}

// Ritual suggestions for each phase
function ritualsForPhase(phaseId) {
  const key = (phaseId || "unknown").toLowerCase().replace(/\s+/g, "_");
  const map = {
    new_moon: ["Set intentions", "Make moon water"],
    waxing_crescent: ["Take small steps", "Light a candle for new beginnings"],
    first_quarter: ["Take action", "Do a focus ritual"],
    waxing_gibbous: ["Refine your work", "Express gratitude"],
    full_moon: ["Release & celebrate", "Do a moon bath"],
    waning_gibbous: ["Reflect & share wisdom"],
    last_quarter: ["Let go & declutter", "Forgiveness meditation"],
    waning_crescent: ["Rest & restore", "Dream journaling"],
    unknown: ["Journal & breathe"]
  };
  return map[key] || map.unknown;
}

// Fetches the daily moon and sun data from  API
export async function fetchMoonCalendar({ year, month, lat = DEFAULT_LAT, lon = DEFAULT_LON } = {}) {
  const base = new Date();
  const y = typeof year === "number" ? year : base.getFullYear();
  const m = typeof month === "number" ? month : base.getMonth();
  const firstDay = new Date(Date.UTC(y, m, 1));
  const lastDay  = new Date(Date.UTC(y, m + 1, 0));
  const startISO = firstDay.toISOString().slice(0, 10);
  const endISO   = lastDay.toISOString().slice(0, 10);


// Tries Open-Meteo first; if network or API fails, uses SunCalc as fallback.
  try {
const url =
  `${OPEN_METEO_URL}?latitude=${lat}&longitude=${lon}` +
  `&start_date=${startISO}&end_date=${endISO}&timezone=auto` +
  `&daily=sunrise,sunset,moonrise,moonset,moon_phase,moon_illumination`;
    const r = await fetch(url);
    if (!r.ok) throw new Error("Open-Meteo error");
    const a = await r.json();

    const days = (a.daily?.time || []).map((iso, i) => {
      // Open-Meteo fields (defensive defaulting)
      const sunrise = a.daily.sunrise?.[i] ? new Date(a.daily.sunrise[i]).toISOString() : null;
      const sunset  = a.daily.sunset?.[i]  ? new Date(a.daily.sunset[i]).toISOString()  : null;
      const rise    = a.daily.moonrise?.[i] ? new Date(a.daily.moonrise[i]).toISOString() : null;
      const set     = a.daily.moonset?.[i]  ? new Date(a.daily.moonset[i]).toISOString()  : null;

      // moon_phase: 0..1 (0 new, 0.25 first quarter, 0.5 full, 0.75 last quarter)
      const phase01 = Number(a.daily.moon_phase?.[i] ?? 0);
      // moon_illumination: 0..100
      const illumination = Math.round(Number(a.daily.moon_illumination?.[i] ?? 0));

      const dateObj = new Date(iso + "T12:00:00Z");
      const pos = SunCalc.getMoonPosition(dateObj, lat, lon);

      // Reuse helpers
      const phaseText = phaseNameFromIllum(phase01);
      const phaseId = phaseText.toLowerCase().replace(/\s+/g, "_");

      return {
        date: iso,
        weekday: weekdayName(iso),
        phase: phaseText,
        phaseId,
        illumination,
        age: approxMoonAgeFromPhase(phase01),
        distanceKm: pos.distance ? Math.round(pos.distance) : null,
        rise,
        set,
        sunrise,
        sunset,
        altitude: pos.altitude != null ? +(pos.altitude * 180 / Math.PI).toFixed(2) : null,
        azimuth:  pos.azimuth  != null ? +(pos.azimuth  * 180 / Math.PI).toFixed(2) : null,
        sign: mockZodiacForDay(i),            // placeholder zodiac (you can swap later)
        rituals: ritualsForPhase(phaseId),
        recommendation: `${phaseText} · ${illumination}% illuminated`,
      };
    });

    return { source: "open-meteo", month: m + 1, year: y, days };
  } catch (e) {
    // Continue to fallback
    console.warn("Open-Meteo unavailable, falling back to SunCalc:", e?.message || e);
  }

  //  Fallback: local SunCalc 
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }).map((_, i) => {
    const date = new Date(Date.UTC(y, m, i + 1, 12, 0, 0));
    const iso = date.toISOString().slice(0, 10);

    const illum = SunCalc.getMoonIllumination(date);
    const mt = SunCalc.getMoonTimes(date, lat, lon);
    const pos = SunCalc.getMoonPosition(date, lat, lon);
    const sunTimes = SunCalc.getTimes(date, lat, lon);

    const phaseText = phaseNameFromIllum(illum.phase);
    const illumination = Math.round((illum.fraction || 0) * 100);
    const phaseId = phaseText.toLowerCase().replace(/\s+/g, "_");

    return {
      date: iso,
      weekday: weekdayName(iso),
      phase: phaseText,
      phaseId,
      illumination,
      age: approxMoonAgeFromPhase(illum.phase),
      distanceKm: pos.distance ? Math.round(pos.distance) : null,
      rise: mt.rise ? new Date(mt.rise).toISOString() : null,
      set:  mt.set  ? new Date(mt.set ).toISOString() : null,
      sunrise: sunTimes.sunrise ? sunTimes.sunrise.toISOString() : null,
      sunset:  sunTimes.sunset  ? sunTimes.sunset .toISOString()  : null,
      altitude: pos.altitude != null ? +(pos.altitude * 180 / Math.PI).toFixed(2) : null,
      azimuth:  pos.azimuth  != null ? +(pos.azimuth  * 180 / Math.PI).toFixed(2) : null,
      sign: mockZodiacForDay(i),
      rituals: ritualsForPhase(phaseId),
      recommendation: `${phaseText} · ${illumination}% illuminated`,
    };
  });

  return { source: "suncalc-fallback", month: m + 1, year: y, days };
}

