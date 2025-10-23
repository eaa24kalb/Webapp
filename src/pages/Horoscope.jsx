import React from "react";
import Card from "../components/Card";

export default function Horoscope() {
  return (
    <div>
      <Card>
        <h3 style={{ marginTop: 0 }}>Horoscope of the Day</h3>
        <p className="small">Your personal life: A gentle phase of inner reflection…</p>
      </Card>

      <div style={{ marginTop: 12 }}>
        <Card>
          <h4 style={{ marginTop: 0 }}>Love</h4>
          <p className="small">Small kindnesses carry big meaning today.</p>
        </Card>
      </div>
    </div>
  );
}
