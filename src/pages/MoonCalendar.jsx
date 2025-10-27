// src/pages/MoonCalendar.jsx
import React, { useEffect, useRef, useState } from "react";
import { fetchMoonCalendar } from "../services/api";
import Card from "../components/Card";
import styles from "../styles/MoonCalendar.module.css";

// helper: chunk array into weeks starting from a given weekday (0=Sun, 1=Mon)
function chunkDaysToWeeks(days = [], weekStart = 1) {
  if (!days || days.length === 0) return [];
  // build map date->day object keyed by ISO
  const first = new Date(days[0].date);
  const last = new Date(days[days.length - 1].date);

  // find first day to show: back up until weekStart
  const start = new Date(first);
  while (start.getDay() !== weekStart) start.setDate(start.getDate() - 1);

  // build continuous list from start to last (inclusive)
  const cursor = new Date(start);
  const all = [];
  const end = new Date(last);
  // pad until we pass end by at least one week
  while (cursor <= end || all.length % 7 !== 0) {
    const iso = cursor.toISOString().slice(0, 10);
    const match = days.find(d => d.date === iso);
    all.push(match || { date: iso, placeholder: true });
    cursor.setDate(cursor.getDate() + 1);
  }

  // chunk into arrays of 7
  const weeks = [];
  for (let i = 0; i < all.length; i += 7) {
    weeks.push(all.slice(i, i + 7));
  }
  return weeks;
}

// simple swipe detection (mouse + touch)
function useSwipe(onLeft = () => {}, onRight = () => {}) {
  const startX = useRef(null);
  const startY = useRef(null);
  const isDragging = useRef(false);

  function handleStart(clientX, clientY) {
    startX.current = clientX;
    startY.current = clientY;
    isDragging.current = true;
  }
  function handleMove(clientX, clientY) {
    if (!isDragging.current || startX.current === null) return;
    const dx = clientX - startX.current;
    const dy = clientY - startY.current;
    // ignore mostly vertical moves
    if (Math.abs(dx) > 30 && Math.abs(dx) > Math.abs(dy)) {
      // we will detect on end
    }
  }
  function handleEnd(clientX) {
    if (!isDragging.current || startX.current === null) return;
    const dx = clientX - startX.current;
    if (dx < -60) onLeft();
    else if (dx > 60) onRight();
    startX.current = null;
    startY.current = null;
    isDragging.current = false;
  }

  return {
    onTouchStart: e => {
      const t = e.touches[0];
      handleStart(t.clientX, t.clientY);
    },
    onTouchEnd: e => {
      // touches empty on end; use changedTouches
      const t = e.changedTouches[0];
      handleEnd(t.clientX);
    },
    onMouseDown: e => handleStart(e.clientX, e.clientY),
    onMouseUp: e => handleEnd(e.clientX),
    onMouseLeave: e => {
      // cancel drag
      startX.current = null; isDragging.current = false;
    }
  };
}

export default function MoonCalendar() {
  const [data, setData] = useState(null);
  const [weeks, setWeeks] = useState([]);
  const [weekIndex, setWeekIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);

  // fetch month once (default current)
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetchMoonCalendar(); // uses defaults
        if (!mounted) return;
        setData(res);
        const w = chunkDaysToWeeks(res.days || [], 1); // monday-start
        setWeeks(w);
        // pick week that contains today's date
        const todayIso = new Date().toISOString().slice(0, 10);
        let idx = w.findIndex(week => week.some(d => d && d.date === todayIso));
        if (idx === -1) idx = 0;
        setWeekIndex(idx);
        setSelected((w[idx] || [])[0] || null);
      } catch (err) {
        console.error(err);
        if (mounted) setData(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  // update selected when week changes
  useEffect(() => {
    if (!weeks || weeks.length === 0) return;
    const wk = weeks[weekIndex] || weeks[0];
    // default select the middle day or first if none
    const pick = wk.find(d => !!d && !d.placeholder) || wk[Math.floor(wk.length / 2)];
    setSelected(pick);
  }, [weekIndex, weeks]);

  const gotoPrev = () => setWeekIndex(i => Math.max(0, i - 1));
  const gotoNext = () => setWeekIndex(i => Math.min(weeks.length - 1, i + 1));

  const swipe = useSwipe(gotoNext, gotoPrev);

  // ensure detail area fits the frame — we'll constrain heights via CSS
  return (
    <div className={styles.calendarFrame}>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ margin: 0 }}>Moon Calendar</h3>
            <div className="small">{data ? `${data.month}/${data.year}` : ""}</div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button className="button" onClick={gotoPrev} aria-label="Previous week">←</button>
            <button className="button" onClick={gotoNext} aria-label="Next week">→</button>
          </div>
        </div>

        <div
          ref={containerRef}
          className={styles.weekScroller}
          // attach swipe handlers
          onTouchStart={swipe.onTouchStart}
          onTouchEnd={swipe.onTouchEnd}
          onMouseDown={swipe.onMouseDown}
          onMouseUp={swipe.onMouseUp}
          onMouseLeave={swipe.onMouseLeave}
        >
          {/* Week row (only one week visible) */}
          <div className={styles.weekRow}>
            {(weeks[weekIndex] || Array.from({ length: 7 })).map((d, idx) => {
              const isEmpty = !d || d.placeholder;
              const isActive = selected && d && d.date === selected.date;
              return (
                <button
                  key={d ? d.date : `empty-${idx}`}
                  className={`${styles.dayCard} ${isActive ? styles.active : ""}`}
                  onClick={() => !isEmpty && setSelected(d)}
                  disabled={isEmpty}
                  aria-pressed={isActive}
                >
                  <div className={styles.date}>{new Date(d ? d.date : null).getDate() || ""}</div>
                  <div className={styles.phaseSmall}>{d && d.phase ? d.phase.split(" ")[0] : ""}</div>
                  <div className={styles.signSmall}>{d && d.sign ? d.sign : ""}</div>
                </button>
              );
            })}
          </div>
        </div>

      </Card>

      {/* Detail area — constrained and scrollable */}
      <div className={styles.detailArea}>
        <Card>
          {selected ? (
            <div className={styles.detailGrid}>
              <div className={styles.detailHero}>
                <h2 style={{ margin: "4px 0 6px", fontSize: 26 }}>{selected.phase}</h2>
                <div className="small" style={{ opacity: 0.9 }}>{selected.illumination}% illuminated</div>

                <div style={{ marginTop: 12 }} className={styles.moonImg} aria-hidden />
              </div>

              <div style={{ minWidth: 0 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>
                  <div>
                    <div className="small">Rise</div>
                    <div style={{ fontWeight: 700 }}>{selected.rise ? new Date(selected.rise).toLocaleTimeString([], { timeStyle: "short" }) : "—"}</div>
                  </div>

                  <div>
                    <div className="small">Set</div>
                    <div style={{ fontWeight: 700 }}>{selected.set ? new Date(selected.set).toLocaleTimeString([], { timeStyle: "short" }) : "—"}</div>
                  </div>

                  <div>
                    <div className="small">Distance</div>
                    <div style={{ fontWeight: 700 }}>{selected.distanceKm ? `${selected.distanceKm.toLocaleString()} km` : "—"}</div>
                  </div>

                  <div>
                    <div className="small">Age</div>
                    <div style={{ fontWeight: 700 }}>{selected.age !== null ? `${selected.age} d` : "—"}</div>
                  </div>

                  <div>
                    <div className="small">Altitude</div>
                    <div style={{ fontWeight: 700 }}>{selected.altitude !== null ? `${selected.altitude}°` : "—"}</div>
                  </div>

                  <div>
                    <div className="small">Azimuth</div>
                    <div style={{ fontWeight: 700 }}>{selected.azimuth !== null ? `${selected.azimuth}°` : "—"}</div>
                  </div>
                </div>

                <div style={{ marginTop: 12 }}>
                  <div className="small">Recommendation</div>
                  <div style={{ marginTop: 6 }}>{selected.recommendation}</div>
                </div>

                <div style={{ marginTop: 12 }}>
                  <div className="small" style={{ marginBottom: 8, fontWeight: 700 }}>Rituals</div>
                  {/* show a compact list of rituals */}
                  <div style={{ display: "grid", gap: 8 }}>
                    {(selected.phaseId ? ( // normalize
                      (() => {
                        const key = selected.phaseId.toLowerCase().replace(/\s+/g, "_");
                        // small mapping inline for simplicity
                        const map = {
                          new_moon: ["New Moon — Set intentions", "Moon water — charge jar overnight"],
                          waxing_crescent: ["Plant seeds — small steps", "Carry citrine"],
                          first_quarter: ["Take decisive action", "Short movement ritual"],
                          waxing_gibbous: ["Polish projects"],
                          full: ["Full moon release", "Full moon bath (moon water)"],
                          waning_gibbous: ["Share & reflect"],
                          last_quarter: ["Let go & declutter"],
                          waning_crescent: ["Rest & prepare"]
                        };
                        return (map[key] || ["Quiet night — journal"]).map((t, i) => (
                          <div key={i} className={styles.ritualCard}>
                            <div style={{ fontWeight: 700 }}>{t}</div>
                            <div className="small" style={{ marginTop: 6 }}>
                              {t.includes("moon water") ? "Fill a jar of clean water and place where it will receive moonlight overnight." : "A short practical action to align with the lunar energy."}
                            </div>
                            <div style={{ marginTop: 8 }}>
                              <button className="button" onClick={() => alert("Saved ritual (demo)")}>Save</button>
                            </div>
                          </div>
                        ));
                      })()
                    ) : null)}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.center}>Select a day to see details</div>
          )}
        </Card>
      </div>
    </div>
  );
}
