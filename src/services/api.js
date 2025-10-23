//MOCK DATE - CHANGE LATER

const USE_REAL_API = false; // flip to true to use real endpoint
const API_URL = import.meta.env.VITE_MOON_API_URL || ""; // placeholder if you add one

function weekdayName(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { weekday: "long" });
}

if (USE_REAL_API && !API_URL) {
  console.warn("USE_REAL_API is true but API_URL is empty. Falling back to mock.");
}

export async function fetchMoonCalendar({ year, month } = {}) {
  if (USE_REAL_API && API_URL) {
    const url = `${API_URL}?year=${year || ""}&month=${month || ""}`;
    const r = await fetch(url);
    return r.json();
  }

  // MOCK: returns 28 simple entries for a lunar month
  const base = new Date();
  const days = Array.from({ length: 28 }).map((_, i) => {
    const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    // cycle phases
    const phases = [
      { id: "new", name: "New Moon", rec: "Set new intentions; cleanse." },
      { id: "wax_cres", name: "Waxing Crescent", rec: "Gentle growth, small projects." },
      { id: "first_quarter", name: "First Quarter", rec: "Take decisive steps." },
      { id: "wax_gib", name: "Waxing Gibbous", rec: "Polish and refine." },
      { id: "full", name: "Full Moon", rec: "Celebrate, release, rituals." },
      { id: "wan_gib", name: "Waning Gibbous", rec: "Reflect and share." },
      { id: "last_quarter", name: "Last Quarter", rec: "Let go; clear space." },
      { id: "wan_cres", name: "Waning Crescent", rec: "Rest and prepare." }
    ];
    const p = phases[i % phases.length];
    const signs = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
    return {
      date: iso,
      weekday: weekdayName(iso),
      phase: p.name,
      phaseId: p.id,
      sign: signs[(base.getDate() + i) % signs.length],
      recommendation: p.rec
    };
  });

  return {
    source: "mock",
    month: (base.getMonth() + 1),
    year: base.getFullYear(),
    days
  };
}