import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Card from "../components/Card";

function PlanetList({ planets }) {
  return (
    <ul style={{ margin: 0, paddingLeft: 16 }}>
      {planets.map(p => (
        <li key={p.name} style={{ marginBottom: 8 }}>
          <strong>{p.name}</strong>: {p.sign} — {p.degrees}
        </li>
      ))}
    </ul>
  );
}

export default function ChartResult() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const result = state?.result;

  if (!result) {
    return (
      <Card>
        <h3 style={{ marginTop: 0 }}>No chart available</h3>
        <p className="small">Please calculate a chart first.</p>
        <div style={{ marginTop: 12 }}>
          <button className="button" onClick={() => navigate("/chart")}>Open birth form</button>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <h3 style={{ marginTop: 0 }}>{result.name}'s Chart</h3>
        <div className="small">Sun: {result.sun} • Moon: {result.moon} • Ascendant: {result.ascendant}</div>
      </Card>

      <div style={{ marginTop: 12 }}>
        <Card>
          <h4 style={{ marginTop: 0 }}>Planets</h4>
          <PlanetList planets={result.planets} />
        </Card>
      </div>

      <div style={{ marginTop: 12 }}>
        <Card>
          <h4 style={{ marginTop: 0 }}>Interpretation</h4>
          <p className="small">This is a mock interpretation for the MVP. Replace this with dynamic text generated either client-side or from your backend.</p>
        </Card>
      </div>
    </>
  );
}
