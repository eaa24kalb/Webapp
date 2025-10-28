// src/services/api.js
// Simple & reliable Moon Calendar API (no external fetch, no zodiac dependency)

import SunCalc from "suncalc";

function weekdayName(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { weekday: "short" });
}

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

function approxMoonAgeFromPhase(phase) {
  return Math.round((phase || 0) * 29.530588853 * 10) / 10;
}

// Simple zodiac placeholders (you can later use a proper zodiac API if you want)
const MOCK_ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

function mockZodiacForDay(index) {
  return MOCK_ZODIAC_SIGNS[index % MOCK_ZODIAC_SIGNS.length];
}

// Rituals for each phase
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

export async function fetchMoonCalendar({ year, month, lat = 55.68, lon = 12.57 } = {}) {
  const base = new Date();
  const y = typeof year === "number" ? year : base.getFullYear();
  const m = typeof month === "number" ? month : base.getMonth();

  const daysInMonth = new Date(y, m + 1, 0).getDate();

  const days = Array.from({ length: daysInMonth }).map((_, i) => {
    // use noon to avoid timezone edge cases
    const date = new Date(Date.UTC(y, m, i + 1, 12, 0, 0));
    const iso = date.toISOString().slice(0, 10);

    const illum = SunCalc.getMoonIllumination(date);
    const mt = SunCalc.getMoonTimes(date, lat, lon);
    const pos = SunCalc.getMoonPosition(date, lat, lon);

    // ✅ new: compute reliable sunrise/sunset
    const sunTimes = SunCalc.getTimes(date, lat, lon);
    const sunrise = sunTimes.sunrise ? sunTimes.sunrise.toISOString() : null;
    const sunset = sunTimes.sunset ? sunTimes.sunset.toISOString() : null;

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
      set: mt.set ? new Date(mt.set).toISOString() : null,
      sunrise, // ✅ added
      sunset,  // ✅ added
      altitude: pos.altitude != null ? +(pos.altitude * 180 / Math.PI).toFixed(2) : null,
      azimuth: pos.azimuth != null ? +(pos.azimuth * 180 / Math.PI).toFixed(2) : null,
      sign: mockZodiacForDay(i),
      rituals: ritualsForPhase(phaseId),
      recommendation: `${phaseText} · ${illumination}% illuminated`,
    };
  });

  return {
    source: "local",
    month: m + 1,
    year: y,
    days
  };
}
