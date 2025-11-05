// src/services/birthchart.js
const ASTRO_URL = import.meta.env.VITE_ASTRO_API_URL || "";
const ASTRO_KEY = import.meta.env.VITE_ASTRO_API_KEY || "";
const ASTRO_SECRET = import.meta.env.VITE_ASTRO_API_SECRET || "";

// ---------- helpers ----------
function toISODate(d) {
  if (!d) return "";
  if (d.includes("-")) return d; // already ISO
  const [dd, mm, yyyy] = d.split(/[./\s]/).map(s => s.trim());
  if (yyyy && mm && dd) {
    const pad = n => String(n).padStart(2, "0");
    return `${yyyy}-${pad(mm)}-${pad(dd)}`;
  }
  return d;
}

function normalizeTimeStr(t) {
  if (!t) return "12:00";
  return t.replace(".", ":");
}

async function geocodeCity(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?count=1&name=${encodeURIComponent(city)}`;
  const r = await fetch(url);
  const j = await r.json();
  const hit = j?.results?.[0];
  if (!hit) throw new Error("City not found");
  return {
    name: hit.name,
    country: hit.country,
    lat: hit.latitude,
    lon: hit.longitude,
  };
}

async function resolveTimezone(lat, lon, isoDateTime) {
  const url = `https://api.open-meteo.com/v1/timezone?latitude=${lat}&longitude=${lon}&date_time=${encodeURIComponent(isoDateTime)}`;
  const r = await fetch(url);
  const j = await r.json();
  return {
    timezone: j?.timezone,
    utcOffsetSeconds: j?.utc_offset_seconds ?? 0,
  };
}

function toUTCISO(isoDate, hhmm, utcOffsetSeconds) {
  const [h, m] = hhmm.split(":").map(Number);
  const local = new Date(`${isoDate}T${String(h).padStart(2, "0")}:${String(m ?? 0).padStart(2, "0")}:00`);
  const utcMs = local.getTime() - (utcOffsetSeconds * 1000);
  return new Date(utcMs).toISOString();
}

// ---------- mock ----------
function mockNatal(lat, lon, isoUTC, name) {
  return {
    source: "mock",
    name: name || "Luna",
    location: { lat, lon },
    momentUTC: isoUTC,
    system: "Tropical / Placidus",
    summary: {
      sun: { sign: "Leo", degree: 12.3, house: 1 },
      moon: { sign: "Sagittarius", degree: 3.1, house: 5 },
      rising: { sign: "Virgo", degree: 18.4 },
    },
    planets: [
      { body: "Sun", sign: "Leo", degree: 12.3, house: 1 },
      { body: "Moon", sign: "Sagittarius", degree: 3.1, house: 5 },
      { body: "Mercury", sign: "Cancer", degree: 25.7, house: 12 },
      { body: "Venus", sign: "Virgo", degree: 2.8, house: 2 },
      { body: "Mars", sign: "Gemini", degree: 9.4, house: 11 },
      { body: "Jupiter", sign: "Pisces", degree: 17.2, house: 7 },
      { body: "Saturn", sign: "Aries", degree: 28.0, house: 8 },
    ],
    houses: Array.from({ length: 12 }, (_, i) => ({ house: i + 1, cusp: (i * 30) % 360 })),
    notes: "Mock chart for demo when no API key is set.",
  };
}

// ---------- main ----------
export async function calculateBirthChart({ name, date, time, city }) {
  const isoDate = toISODate(date);
  const hhmm = normalizeTimeStr(time);
  const place = await geocodeCity(city);
  const tz = await resolveTimezone(place.lat, place.lon, `${isoDate}T${hhmm}`);

  const birthUTC = toUTCISO(isoDate, hhmm, tz.utcOffsetSeconds);

  if (!ASTRO_URL) {
    return mockNatal(place.lat, place.lon, birthUTC, name);
  }

  // Adjust for your chosen provider
  const payload = {
    name,
    date: isoDate,
    time: hhmm,
    latitude: place.lat,
    longitude: place.lon,
    timezone: tz.timezone,
  };

  const headers = { "Content-Type": "application/json" };
  if (ASTRO_KEY && ASTRO_SECRET) {
    headers["Authorization"] = "Basic " + btoa(`${ASTRO_KEY}:${ASTRO_SECRET}`);
  } else if (ASTRO_KEY) {
    headers["x-api-key"] = ASTRO_KEY;
  }

  const res = await fetch(ASTRO_URL, { method: "POST", headers, body: JSON.stringify(payload) });
  if (!res.ok) {
    console.warn("Astrology API failed, using mock:", await res.text());
    return mockNatal(place.lat, place.lon, birthUTC, name);
  }
  const data = await res.json();

  return {
    source: "api",
    name: name || data?.name,
    location: { lat: place.lat, lon: place.lon, city: place.name, country: place.country },
    momentUTC: birthUTC,
    system: data?.system || "Tropical / Placidus",
    summary: {
      sun: data?.summary?.sun || data?.sun || { sign: "—", degree: null, house: null },
      moon: data?.summary?.moon || data?.moon || { sign: "—", degree: null, house: null },
      rising: data?.summary?.rising || data?.ascendant || { sign: "—", degree: null },
    },
    planets: data?.planets || [],
    houses: data?.houses || [],
  };
}
