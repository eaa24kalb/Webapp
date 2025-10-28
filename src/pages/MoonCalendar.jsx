// src/pages/MoonCalendar.jsx
import React, { useEffect, useRef, useState } from "react";
import { fetchMoonCalendar } from "../services/api";
import styles from "../styles/MoonCalendar.module.css";

function chunkDaysToWeeks(days = [], weekStart = 1) {
  if (!days?.length) return [];
  const first = new Date(days[0].date);
  const last = new Date(days[days.length - 1].date);
  const start = new Date(first);
  while (start.getDay() !== weekStart) start.setDate(start.getDate() - 1);
  const cursor = new Date(start);
  const all = [];
  const end = new Date(last);
  while (cursor <= end || all.length % 7 !== 0) {
    const iso = cursor.toISOString().slice(0, 10);
    const match = days.find(d => d.date === iso);
    all.push(match || { date: iso, placeholder: true });
    cursor.setDate(cursor.getDate() + 1);
  }
  const weeks = [];
  for (let i = 0; i < all.length; i += 7) weeks.push(all.slice(i, i + 7));
  return weeks;
}

function useSwipe(onLeft = () => {}, onRight = () => {}) {
  const startX = useRef(null), startY = useRef(null), dragging = useRef(false);
  const start = (x, y) => { startX.current = x; startY.current = y; dragging.current = true; };
  const end = (x) => {
    if (!dragging.current || startX.current == null) return;
    const dx = x - startX.current;
    if (dx < -60) onLeft(); else if (dx > 60) onRight();
    startX.current = null; startY.current = null; dragging.current = false;
  };
  return {
    onTouchStart: e => start(e.touches[0].clientX, e.touches[0].clientY),
    onTouchEnd: e => end(e.changedTouches[0].clientX),
    onMouseDown: e => start(e.clientX, e.clientY),
    onMouseUp: e => end(e.clientX),
    onMouseLeave: () => { startX.current = null; dragging.current = false; }
  };
}

export default function MoonCalendar() {
  const [data, setData] = useState(null);
  const [weeks, setWeeks] = useState([]);
  const [weekIndex, setWeekIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetchMoonCalendar();
        if (!mounted) return;
        setData(res);
        const w = chunkDaysToWeeks(res.days || [], 1);
        setWeeks(w);

        const todayIso = new Date().toISOString().slice(0, 10);
        let idx = w.findIndex(week => week.some(d => d && d.date === todayIso));
        if (idx === -1) idx = 0;
        setWeekIndex(idx);

        const wk = w[idx] || [];
        const firstReal = wk.find(d => d && !d.placeholder) || wk[0] || null;
        setSelected(firstReal);
      } finally { mounted && setLoading(false); }
    })();
    return () => { mounted = false; };
  }, []);

  const gotoPrev = () => setWeekIndex(i => Math.max(0, i - 1));
  const gotoNext = () => setWeekIndex(i => Math.min(weeks.length - 1, i + 1));
  const swipe = useSwipe(gotoNext, gotoPrev);
  const time = iso => iso ? new Date(iso).toLocaleTimeString([], { timeStyle: "short" }) : "—";

  const wk = weeks[weekIndex] || [];
  const chips = (() => {
    const arr = wk.slice(0, 7); // all 7
    while (arr.length < 7) arr.push(null);
    return arr;
  })();

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.topRow}>
          <button className={styles.backBtn} onClick={() => history.back()} aria-label="Back">←</button>
          <div className={styles.topTitle}>Moon Calendar</div>
          <div className={styles.monthBadge}>{data ? `${data.month}/${data.year}` : ""}</div>
        </div>

        {/* 7 fixed chips */}
        <div
          className={styles.weekRow7}
          onTouchStart={swipe.onTouchStart}
          onTouchEnd={swipe.onTouchEnd}
          onMouseDown={swipe.onMouseDown}
          onMouseUp={swipe.onMouseUp}
          onMouseLeave={swipe.onMouseLeave}
        >
          {chips.map((d, idx) => {
            const isEmpty = !d || d.placeholder;
            const isActive = selected && d && d.date === selected.date;
            const dt = d ? new Date(d.date) : null;
            const w = dt ? dt.toLocaleDateString(undefined, { weekday: "short" }).toUpperCase() : "";
            const m = dt ? dt.toLocaleDateString(undefined, { month: "short" }) : "";
            const day = dt ? dt.getDate() : "";
            return (
              <button
                key={d ? d.date : `empty-${idx}`}
                className={`${styles.chip} ${isActive ? styles.chipActive : ""}`}
                onClick={() => !isEmpty && setSelected(d)}
                disabled={isEmpty}
                aria-pressed={isActive}
              >
                <div className={styles.chipTop}>{w}</div>
                <div className={styles.chipBottom}>{m} {day}</div>
              </button>
            );
          })}
        </div>

        {/* arrows UNDER the chips */}
        <div className={styles.weekArrowsUnder}>
          <button className={styles.arrowBtn} onClick={gotoPrev} aria-label="Previous week">←</button>
          <button className={styles.arrowBtn} onClick={gotoNext} aria-label="Next week">→</button>
        </div>

        {/* phase + % */}
        <h1 className={styles.phaseTitle}>{selected?.phase || "—"}</h1>
        <div className={styles.phaseSub}>
          {selected?.illumination != null ? `${selected.illumination}% illuminated` : "—"}
        </div>

        {/* moon image */}
        <div className={styles.moonWrap}><div className={styles.moonImg} aria-hidden /></div>

        {/* times */}
        <div className={styles.timesRow}>
          <div className={styles.timeCol}><span className={styles.timeIcon}>🌙⬆️</span><div className={styles.timeText}>{time(selected?.rise)}</div></div>
          <div className={styles.timeCol}><span className={styles.timeIcon}>🌙⬇️</span><div className={styles.timeText}>{time(selected?.set)}</div></div>
          <div className={styles.timeCol}><span className={styles.timeIcon}>☀️⬆️</span><div className={styles.timeText}>{time(selected?.sunrise)}</div></div>
          <div className={styles.timeCol}><span className={styles.timeIcon}>☀️⬇️</span><div className={styles.timeText}>{time(selected?.sunset)}</div></div>
        </div>

        <div className={styles.dots}><span className={styles.dot} /><span className={`${styles.dot} ${styles.dotActive}`} /></div>

        {/* info */}
        <div className={styles.infoGrid}>
          <div className={styles.infoRow}><span>Moon Distance:</span><strong>{selected?.distanceKm ? `${selected.distanceKm.toLocaleString()} km` : "—"}</strong></div>
          <div className={styles.infoRow}><span>Moon Age:</span><strong>{selected?.age != null ? `${selected.age} days` : "—"}</strong></div>
          <div className={styles.infoRow}><span>Moon Zodiac:</span><strong>{selected?.sign || "—"}</strong></div>
          <div className={styles.infoRow}><span>Altitude:</span><strong>{selected?.altitude != null ? `${selected.altitude}°` : "—"}</strong></div>
          <div className={styles.infoRow}><span>Azimuth:</span><strong>{selected?.azimuth != null ? `${selected.azimuth}°` : "—"}</strong></div>
        </div>

        {/* rituals – unchanged */}
        <div className={styles.ritualsWrap}>
          <div className={styles.ritualsTitle}>Rituals</div>
          <div className={styles.ritualGrid}>
            {(() => {
              const key = (selected?.phaseId || "unknown").toLowerCase().replace(/\s+/g, "_");
              const map = {
                new_moon: ["New Moon — Set intentions", "Moon water — charge jar overnight"],
                waxing_crescent: ["Plant seeds — small steps", "Carry citrine"],
                first_quarter: ["Take decisive action", "Short movement ritual"],
                waxing_gibbous: ["Polish projects"],
                full: ["Full moon release", "Full moon bath (moon water)"],
                waning_gibbous: ["Share & reflect"],
                last_quarter: ["Let go & declutter"],
                waning_crescent: ["Rest & prepare"],
                unknown: ["Quiet night — journal"]
              };
              return (map[key] || map.unknown).map((t, i) => (
                <div key={i} className={styles.ritualCard}>
                  <div className={styles.ritualTitle}>{t}</div>
                  <div className={styles.ritualDesc}>
                    {t.includes("moon water")
                      ? "Fill a jar of clean water and place it where it will receive moonlight overnight."
                      : "A short practical action to align with the lunar energy."}
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>

        {loading && <div className={styles.center}>Loading…</div>}
      </section>
    </div>
  );
}
