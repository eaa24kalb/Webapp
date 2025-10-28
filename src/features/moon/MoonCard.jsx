import React from "react";
import SunCalc from "suncalc";
import { Link } from "react-router-dom";

function getMoonPhaseName(phase) {
  if (phase === null) return "Unknown";
  if (phase < 0.03 || phase > 0.97) return "New Moon";
  if (phase < 0.25) return "Waxing Crescent";
  if (phase === 0.25) return "First Quarter";
  if (phase < 0.5) return "Waxing Gibbous";
  if (phase === 0.5) return "Full Moon";
  if (phase < 0.75) return "Waning Gibbous";
  if (phase === 0.75) return "Last Quarter";
  return "Waning Crescent";
}

export default function MoonCard({ date = new Date(), lat = 55.68, lon = 12.57 }) {
  const illum = SunCalc.getMoonIllumination(date); // fraction, phase, angle
  const times = SunCalc.getMoonTimes(date, lat, lon);
  const phaseName = getMoonPhaseName(illum.phase);
  const illuminationPercent = Math.round(illum.fraction * 100);

  return (
    <Link to="/moon" style={{ textDecoration: "none", color: "inherit" }}>
      <section className="card" aria-labelledby="moon-title" style={{ marginBottom: 16 }}>
        {/* existing content unchanged */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 id="moon-title" style={{ margin: 0 }}>Current Moon Phase</h3>
            <div className="small">{phaseName} · {illuminationPercent}% lit</div>
          </div>

          <div aria-hidden>
            {/* simple SVG */}
            <svg width="68" height="68" viewBox="0 0 72 72" role="img" aria-hidden="true">
              <circle cx="36" cy="36" r="28" fill="#FFFBF0" opacity="0.9" />
              <circle cx={36 + (illum.angle || 0) * 2} cy="36" r="28" fill="#2b2130" opacity="0.45" />
            </svg>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <div className="small">Rise: {times.rise ? new Date(times.rise).toLocaleTimeString([], { timeStyle: "short" }) : "—"}</div>
          <div className="small" style={{ marginTop: 4 }}>Set: {times.set ? new Date(times.set).toLocaleTimeString([], { timeStyle: "short" }) : "—"}</div>
        </div>
      </section>
    </Link>
  );
}
