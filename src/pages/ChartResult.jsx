import React from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import Card from "../components/Card";
import ChartWheel from "../features/birthchart/ChartWheel";
import { loadSavedResult, clearSavedChart } from "../features/birthchart/useLocalChart";

function PlanetList({ planets }) {
  if (!planets?.length) return <div className="small">No planets available.</div>;
  return (
    <ul style={{ margin: 0, paddingLeft: 16 }}>
      {planets.map((p, i) => (
        <li key={p.body || p.name || i} style={{ marginBottom: 6 }}>
          <strong>{p.body || p.name}</strong>: {p.sign || "—"}
          {p.degree != null ? ` — ${p.degree.toFixed ? p.degree.toFixed(1) : p.degree}°` : ""}
          {p.house ? `, House ${p.house}` : ""}
        </li>
      ))}
    </ul>
  );
}

export default function ChartResult() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const result = state?.result || loadSavedResult(); // ✅ fallback

  if (!result) {
    return (
      <Card>
        <h3 style={{ marginTop: 0 }}>No chart available</h3>
        <p className="small">
          Please calculate a chart first on the <Link to="/chart">birth chart</Link> page.
        </p>
        <div style={{ marginTop: 12 }}>
          <button className="button" onClick={() => navigate("/chart")}>Open birth form</button>
        </div>
      </Card>
    );
  }

  const sun = result.summary?.sun?.sign || result.sun;
  const moon = result.summary?.moon?.sign || result.moon;
  const asc  = result.summary?.rising?.sign || result.ascendant;

  return (
    <>
      <Card>
        <h3 style={{ marginTop: 0 }}>{result.name ? `${result.name} — ` : ""}Natal Summary</h3>
        <div className="small">
          {sun ? `Sun: ${sun}` : ""} {moon ? `• Moon: ${moon}` : ""} {asc ? `• Rising: ${asc}` : ""}
        </div>
        <div className="small" style={{ marginTop: 6 }}>{result.system || result.source}</div>
      </Card>

      <div style={{ marginTop: 12 }}>
        <Card>
          {/* ✅ the SVG wheel */}
          <ChartWheel result={result} size={360} />
        </Card>
      </div>

      <div style={{ marginTop: 12 }}>
        <Card>
          <h4 style={{ marginTop: 0 }}>Planets</h4>
          <PlanetList planets={result.planets} />
        </Card>
      </div>

      <div style={{ marginTop: 12 }}>
        <Card>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="button" onClick={() => navigate("/chart")}>New chart</button>
            <button className="button" onClick={() => { clearSavedChart(); navigate("/chart"); }}>
              Clear saved
            </button>
          </div>
        </Card>
      </div>
    </>
  );
}
