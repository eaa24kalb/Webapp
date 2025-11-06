// Simple form to collect birth data and calculate a birthchart

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { calculateBirthChart } from "../../services/birthchart";
import { loadSavedForm, saveForm, saveResult } from "./useLocalChart";

export default function BirthForm() {
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "Luna", date: "", time: "", city: "London" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

    // Autosave restore
  useEffect(() => {
    const saved = loadSavedForm();
    if (saved) setForm(prev => ({ ...prev, ...saved }));
  }, []);

  function update(e) {
    const next = { ...form, [e.target.name]: e.target.value };
    setForm(next);
    saveForm(next);
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");

    // require date, time, city
    if (!form.date || !form.time || !form.city) {
      setErr("Please fill date, time and city.");
      return;
    }
    try {
      setLoading(true);

      // Calculate chart
      const result = await calculateBirthChart(form);
      saveForm(form);
      saveResult(result);
      nav("/chart/result", { state: { result } });
    } catch (ex) {
      console.error(ex);
      setErr("We couldn't calculate your chart. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="formStack">
      <label className="fieldLabel">Name (optional)</label>
      <input name="name" value={form.name} onChange={update} placeholder="Luna" />

      <label className="fieldLabel">Date of birth</label>
      <input name="date" value={form.date} onChange={update} placeholder="dd.mm.yyyy" />

      <label className="fieldLabel">Time of birth</label>
      <input name="time" value={form.time} onChange={update} placeholder="hh:mm" />

      <label className="fieldLabel">Place of birth (city)</label>
      <input name="city" value={form.city} onChange={update} placeholder="City" />

      {err ? <div className="formError">{err}</div> : null}

      <button className="button" type="submit" disabled={loading}>
        {loading ? "Calculating…" : "Calculate birth chart"}
      </button>
    </form>
  );
}
