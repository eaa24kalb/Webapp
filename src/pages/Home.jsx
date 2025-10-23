import React from "react";
import MoonCard from "../features/moon/MoonCard";
import Card from "../components/Card";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div>
      <MoonCard />
      <Card style={{ marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>Your day at a glance</h3>
        <p className="small">Your beautiful heart will bring you beautiful things. A gentle reminder to take a breath and set an intention for the day.</p>
        <div style={{ marginTop: 10 }}>
          <Link to="/chart" className="button">Open Birth Chart</Link>
        </div>
      </Card>

      <Card>
        <h4 style={{ marginTop: 0 }}>Community</h4>
        <div className="small">Alissa (♊) • Magnus (♍) • Maria (♏)</div>
        <p className="small" style={{ marginTop: 10 }}>A small community feed will live here. For the MVP this is static.</p>
      </Card>
    </div>
  );
}
