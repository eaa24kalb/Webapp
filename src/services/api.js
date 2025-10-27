// src/services/api.js
import SunCalc from "suncalc";

const USE_REAL_API = true; // flip to false for offline dev / no network
const FARMSENSE_URL = "https://api.farmsense.net/v1/moonphases/";

// helper
function weekdayName(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { weekday: "short" });
}

// approximate moon age from illumination phase (fallback)
function approxMoonAgeFromPhase(phase) {
  // phase is 0..1 (from suncalc.getMoonIllumination), lunation ~29.53 days
  return Math.round((phase || 0) * 29.530588853 * 10) / 10;
}

/**
 * fetchMoonCalendar({ year, month, lat, lon })
 * - year: integer (e.g. 2025)
 * - month: 0-based month (0 = Jan) or 1-based if you prefer (we use 0-based internally)
 * - lat/lon: optional coords (used by suncalc to compute pos/times)
 *
 * Returns: { source, month, year, days: [ { date, weekday, phase, phaseId, illumination, age, distanceKm, rise, set, altitude, azimuth, sign, recommendation } ] }
 */
export async function fetchMoonCalendar({ year, month, lat = 55.68, lon = 12.57 } = {}) {
  const base = new Date();
  const yearToUse = typeof year === "number" ? year : base.getFullYear();
  // accept month either 0-based or 1-based (if >11 assume 1-based)
  let monthToUse = typeof month === "number" ? month : base.getMonth();
  if (monthToUse > 11) monthToUse = monthToUse - 1;

  const daysInMonth = new Date(yearToUse, monthToUse + 1, 0).getDate();

  if (!USE_REAL_API) {
    // simple mock - keep shape consistent with real response
    const mockDays = Array.from({ length: daysInMonth }).map((_, i) => {
      const date = new Date(yearToUse, monthToUse, i + 1);
      const iso = date.toISOString().slice(0, 10);
      const illum = SunCalc.getMoonIllumination(date);
      const times = SunCalc.getMoonTimes(date, lat, lon);
      const pos = SunCalc.getMoonPosition(date, lat, lon);

      const phases = [
        "New Moon",
        "Waxing Crescent",
        "First Quarter",
        "Waxing Gibbous",
        "Full Moon",
        "Waning Gibbous",
        "Last Quarter",
        "Waning Crescent"
      ];
      const p = phases[i % phases.length];

      return {
        date: iso,
        weekday: weekdayName(iso),
        phase: p,
        phaseId: p.toLowerCase().replace(/\s+/g, "_"),
        illumination: Math.round(illum.fraction * 100),
        age: approxMoonAgeFromPhase(illum.phase),
        distanceKm: Math.round((pos.distance || 384400)), // pos.distance may be undefined in some suncalc builds
        rise: times.rise ? new Date(times.rise).toISOString() : null,
        set: times.set ? new Date(times.set).toISOString() : null,
        altitude: pos.altitude !== undefined ? Number((pos.altitude * (180 / Math.PI)).toFixed(2)) : null,
        azimuth: pos.azimuth !== undefined ? Number((pos.azimuth * (180 / Math.PI)).toFixed(2)) : null,
        sign: "—",
        recommendation: `A ${p.toLowerCase()} day — a gentle time for reflection.`,
      };
    });

    return { source: "mock", month: monthToUse + 1, year: yearToUse, days: mockDays };
  }

  // REAL API path: call Farmsense for each day, then enrich with SunCalc
  const results = await Promise.all(
    Array.from({ length: daysInMonth }, async (_, i) => {
      const date = new Date(yearToUse, monthToUse, i + 1);
      const iso = date.toISOString().slice(0, 10);
      const timestamp = Math.floor(date.getTime() / 1000);

      try {
        const resp = await fetch(`${FARMSENSE_URL}?d=${timestamp}`);
        const data = await resp.json();

        // Farmsense response sample: array with object containing Phase, Illumination, Age, Distance
        const info = Array.isArray(data) ? data[0] : data || {};
        const phase = info.Phase || info.phase || "Unknown";
        // Illumination may be decimal (0..1) or percentage; try both
        let illumVal = 0;
        if (info.Illumination !== undefined) {
          illumVal = Number(info.Illumination);
          if (illumVal > 1) illumVal = illumVal / 100;
        } else if (info.Illum !== undefined) {
          illumVal = Number(info.Illum);
        }
        const illumination = Math.round((illumVal || 0) * 100);
        const age = info.Age !== undefined ? Number(info.Age) : null;
        const distanceKm = info.Distance !== undefined ? Number(info.Distance) : null;

        // suncalc for times and position (requires lat/lon)
        const scIllum = SunCalc.getMoonIllumination(date);
        const times = SunCalc.getMoonTimes(date, lat, lon);
        const pos = SunCalc.getMoonPosition(date, lat, lon);

        return {
          date: iso,
          weekday: weekdayName(iso),
          phase,
          phaseId: phase.toLowerCase().replace(/\s+/g, "_"),
          illumination: illumination || Math.round(scIllum.fraction * 100),
          age: age !== null ? age : approxMoonAgeFromPhase(scIllum.phase),
          distanceKm: distanceKm || (pos.distance ? Math.round(pos.distance) : null),
          rise: times.rise ? new Date(times.rise).toISOString() : null,
          set: times.set ? new Date(times.set).toISOString() : null,
          altitude: pos.altitude !== undefined ? Number((pos.altitude * (180 / Math.PI)).toFixed(2)) : null,
          azimuth: pos.azimuth !== undefined ? Number((pos.azimuth * (180 / Math.PI)).toFixed(2)) : null,
          // zodiac sign placeholder — add accurate ecliptic calc later if wanted
          sign: "—",
          recommendation: `${phase} · ${illumination || Math.round(scIllum.fraction * 100)}% illuminated`,
        };
      } catch (err) {
        console.warn("Moon fetch failed for", iso, err);
        const scIllum = SunCalc.getMoonIllumination(date);
        const times = SunCalc.getMoonTimes(date, lat, lon);
        const pos = SunCalc.getMoonPosition(date, lat, lon);
        return {
          date: iso,
          weekday: weekdayName(iso),
          phase: "Unknown",
          phaseId: "unknown",
          illumination: Math.round(scIllum.fraction * 100),
          age: approxMoonAgeFromPhase(scIllum.phase),
          distanceKm: pos.distance ? Math.round(pos.distance) : null,
          rise: times.rise ? new Date(times.rise).toISOString() : null,
          set: times.set ? new Date(times.set).toISOString() : null,
          altitude: pos.altitude !== undefined ? Number((pos.altitude * (180 / Math.PI)).toFixed(2)) : null,
          azimuth: pos.azimuth !== undefined ? Number((pos.azimuth * (180 / Math.PI)).toFixed(2)) : null,
          sign: "—",
          recommendation: "Could not fetch remote moon data — showing local calc.",
        };
      }
    })
  );

  return { source: "real", month: monthToUse + 1, year: yearToUse, days: results };
}
