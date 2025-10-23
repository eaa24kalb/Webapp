import React, { useState } from "react";
import useBirthCalc from "./useBirthCalc";
import { useNavigate } from "react-router-dom";

export default function BirthForm() {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [place, setPlace] = useState("");
  const { run, loading, error } = useBirthCalc();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!date) return alert("Please enter a birth date");
    try {
      const result = await run({ name, date, time, place });
      // navigate to result page with state
      navigate("/chart/result", { state: { result } });
    } catch (err) {
      console.error(err);
      alert("Calculation failed");
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
      <label>
        <div className="small">Name (optional)</div>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Luna" style={{ width: "100%", padding: 8, borderRadius:8 }} />
      </label>

      <label>
        <div className="small">Date of birth</div>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} required style={{ width: "100%", padding:8, borderRadius:8 }} />
      </label>

      <label>
        <div className="small">Time of birth</div>
        <input type="time" value={time} onChange={e => setTime(e.target.value)} style={{ width: "100%", padding:8, borderRadius:8 }} />
      </label>

      <label>
        <div className="small">Place of birth (city)</div>
        <input value={place} onChange={e => setPlace(e.target.value)} placeholder="Copenhagen" style={{ width: "100%", padding:8, borderRadius:8 }} />
      </label>

      <div>
        <button type="submit" className="button" disabled={loading}>{loading ? "Calculating…" : "Calculate birth chart"}</button>
        {error && <div className="small" style={{ color: "salmon" }}>{error}</div>}
      </div>
    </form>
  );
}
