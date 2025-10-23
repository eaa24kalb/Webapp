import { useState, useEffect } from "react";

const LAST_KEY = "celestia:lastChart";

export default function useBirthCalc() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // optional: could preload last result if needed
  }, []);

  async function run({ name, date, time, place, lat, lon }) {
    setLoading(true);
    setError(null);
    try {
      // ...existing mock logic to produce `mock` (keep it same)
      const [y,m,d] = date.split("-").map(Number);
      const monthDay = `${m}-${d}`;
      const zodiacRanges = [
        { sign: "Capricorn", start: "12-22", end: "1-19" },
        { sign: "Aquarius", start: "1-20", end: "2-18" },
        { sign: "Pisces", start: "2-19", end: "3-20" },
        { sign: "Aries", start: "3-21", end: "4-19" },
        { sign: "Taurus", start: "4-20", end: "5-20" },
        { sign: "Gemini", start: "5-21", end: "6-20" },
        { sign: "Cancer", start: "6-21", end: "7-22" },
        { sign: "Leo", start: "7-23", end: "8-22" },
        { sign: "Virgo", start: "8-23", end: "9-22" },
        { sign: "Libra", start: "9-23", end: "10-22" },
        { sign: "Scorpio", start: "10-23", end: "11-21" },
        { sign: "Sagittarius", start: "11-22", end: "12-21" },
      ];
      function mdToNum(s) {
        const [mm, dd] = s.split("-").map(Number);
        return mm*100 + dd;
      }
      const mdNum = mdToNum(monthDay);
      let sun = "Unknown";
      for (const z of zodiacRanges) {
        const start = mdToNum(z.start);
        const end = mdToNum(z.end);
        if ((start <= end && mdNum >= start && mdNum <= end) ||
            (start > end && (mdNum >= start || mdNum <= end))) {
          sun = z.sign;
          break;
        }
      }
      const ascendant = time ? ["Aries","Taurus","Gemini","Cancer","Leo","Virgo"][Number(time.split(":")[0]) % 6] : "Unknown";
      const mock = {
        id: `chart-${Date.now()}`,
        name: name || "Luna",
        sun,
        moon: "Scorpio",
        ascendant,
        planets: [
          { name: "Sun", sign: sun, degrees: "5° 12'" },
          { name: "Moon", sign: "Scorpio", degrees: "20° 05'" },
          { name: "Mercury", sign: "Libra", degrees: "12° 08'" }
        ],
        generatedAt: new Date().toISOString()
      };

      await new Promise(r => setTimeout(r, 400));
      setLoading(false);

      // persist the last chart (and optionally push to a "history" array)
      try {
        const raw = JSON.stringify(mock);
        localStorage.setItem(LAST_KEY, raw);
      } catch (e) {
        console.warn("Failed to persist chart", e);
      }

      return mock;
    } catch (err) {
      setLoading(false);
      setError("Mock calculation failed");
      throw err;
    }
  }

  function loadLast() {
    try {
      const raw = localStorage.getItem(LAST_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  return { run, loading, error, loadLast };
}