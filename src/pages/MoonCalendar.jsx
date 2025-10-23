// src/pages/MoonCalendar.jsx
import React, { useEffect, useState } from "react";
import { fetchMoonCalendar } from "../services/api";
import Card from "../components/Card";
import styles from "../styles/MoonCalendar.module.css";
import { useFavorites } from "../contexts/FavoritesContext";

export default function MoonCalendar() {
  const [data, setData] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toggle, isFavorited } = useFavorites();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchMoonCalendar().then((res) => { if (mounted) { setData(res); setSelected(res?.days?.[0]); setLoading(false); }});
    return () => (mounted = false);
  }, []);

  if (loading) return <Card><div className={styles.center}>Loading moon calendar…</div></Card>;
  if (!data) return <Card><div className={styles.center}>No calendar found.</div></Card>;

  return (
    <div>
      <Card>
        <h3 style={{ marginTop: 0 }}>Moon Calendar — {data.month}/{data.year}</h3>
        <p className="small">Tap a day to read the phase, sign & recommendations.</p>
      </Card>

      <div className={styles.gridWrap}>
        {data.days.map(d => (
          <button
            key={d.date}
            className={`${styles.dayCard} ${selected?.date === d.date ? styles.active : ""}`}
            onClick={() => setSelected(d)}
          >
            <div className={styles.date}>{new Date(d.date).getDate()}</div>
            <div className={styles.phaseSmall}>{d.phase}</div>
            <div className={styles.signSmall}>{d.sign}</div>
          </button>
        ))}
      </div>

      {selected && (
        <div style={{ marginTop: 12 }}>
          <Card>
            <h4 style={{ marginTop: 0 }}>{selected.date} — {selected.weekday}</h4>
            <div className="small">Phase: <strong>{selected.phase}</strong></div>
            <div className="small">Sign: <strong>{selected.sign}</strong></div>

            <div style={{ marginTop: 10 }}>
              <p className="small">{selected.recommendation}</p>
              <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                <button
                  className="button"
                  onClick={() =>
                    toggle({
                      id: `moon-${selected.date}`,
                      type: "moon-day",
                      title: `${selected.phase} — ${selected.date}`,
                      meta: { date: selected.date, sign: selected.sign }
                    })
                  }
                >
                  {isFavorited(`moon-${selected.date}`) ? "Unfavorite" : "Favorite day"}
                </button>
                <button
                  className="button"
                  onClick={() => alert("Open a detailed lunar ritual composer (TBD)")}
                >
                  Start ritual
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
