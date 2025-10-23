import React from "react";
import Card from "../components/Card";
import BirthForm from "../features/birthchart/BirthForm";

export default function Chart() {
  return (
    <>
      <Card>
        <h3 style={{ marginTop: 0 }}>Birth Chart</h3>
        <p className="small">Enter your birth data to generate a natal summary. Exact time increases accuracy.</p>
      </Card>

      <div style={{ marginTop: 16 }}>
        <Card>
          <BirthForm />
        </Card>
      </div>
    </>
  );
}
