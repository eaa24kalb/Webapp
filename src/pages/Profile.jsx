// src/pages/Profile.jsx
import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import Card from "../components/Card";
import ChartWheel from "../features/birthchart/ChartWheel";
import { loadSavedResult } from "../features/birthchart/useLocalChart";
import styles from "../styles/Profile.module.css";
import Avatar1 from "../assets/images/Avatar1.png";

export default function Profile() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("chart"); // "chart" | "saved" | "settings"

  const result = useMemo(() => loadSavedResult(), []);
  const sun = result?.summary?.sun?.sign;
  const moon = result?.summary?.moon?.sign;
  const ascendant = result?.summary?.rising?.sign; // ✅ renamed for clarity

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerRow}>
          <div className={styles.userBlock}>
            <img src={Avatar1} alt="Luna" className={styles.avatar} />
            <div>
              <div className={styles.name}>Luna Hart</div>
              <div className={styles.handle}>@lunahart</div>
              <div className={styles.badges}>
                {sun && <span className={styles.badge}>♌ {sun}</span>}
                {moon && <span className={styles.badge}>☽ {moon}</span>}
                {ascendant && <span className={styles.badge}>↗ {ascendant}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <nav className={styles.tabs} aria-label="Profile sections">
          <button
            className={`${styles.tab} ${tab === "chart" ? styles.active : ""}`}
            onClick={() => setTab("chart")}
          >
            Chart
          </button>
          <button
            className={`${styles.tab} ${tab === "saved" ? styles.active : ""}`}
            onClick={() => setTab("saved")}
          >
            Saved
          </button>
          <button
            className={`${styles.tab} ${tab === "settings" ? styles.active : ""}`}
            onClick={() => setTab("settings")}
          >
            Settings
          </button>
        </nav>
      </header>

      {/* Content */}
      <section className={styles.content}>
        {tab === "chart" && (
          <>
            {/* Wheel or call-to-action */}
            <Card className={styles.card}>
              {result ? (
                <div className={styles.wheelWrap}>
                  <ChartWheel result={result} size={300} />
                </div>
              ) : (
                <div className={styles.empty}>
                  <p className="small">No chart yet.</p>
                  <Link to="/chart" className={styles.ctaBtn}>
                    Create your birth chart
                  </Link>
                </div>
              )}
            </Card>

            {/* Sun / Moon / Ascendant cards */}
            {result && (
              <div className={styles.infoGrid}>
                <Card className={styles.infoCard}>
                  <h4 className={styles.infoTitle}>Sun in {sun || "—"}</h4>
                  <p className={styles.infoText}>
                    The sun determines your ego, identity, and “role” in life. It's the core of who you are.
                    <br />
                    <br />
                    Your Sun in {sun || "—"} suggests a natural drive to express your creative center and lead with warmth.
                    Use your gifts with generosity and courage.
                  </p>
                </Card>
<br />
                <Card className={styles.infoCard}>
                  <h4 className={styles.infoTitle}>Moon in {moon || "—"}</h4>
                  <p className={styles.infoText}>
                    The moon rules emotions, instincts, and inner needs. 
                    <br />
                    <br />
                    With your Moon in {moon || "—"}, you feel most at ease
                    when your private world is nurtured. Honor your rhythms; seek spaces and rituals that soothe your heart.
                  </p>
                </Card>
<br />
                <Card className={styles.infoCard}>
                  <h4 className={styles.infoTitle}>Ascendant in {ascendant || "—"}</h4>
                  <p className={styles.infoText}>
                    Your Ascendant (rising sign) reflects the way you present yourself to the world - your outward personality,
                    first impressions, and spontaneous reactions. 
                    <br />
                    <br />
                    With your Ascendant in {ascendant || "—"}, you approach life
                    with an energy that shapes how others perceive you - the first light that shines before the rest of your chart unfolds.
                  </p>
                </Card>
              </div>
            )}

            {/* Horoscope of the day */}
            <Card className={styles.horoCard}>
              <h3 className={styles.horoTitle}>Horoscope of the day</h3>
              <div className={styles.horoGrid}>
                <div className={styles.horoBlock}>
                  <div className={styles.horoBlockTitle}>Personal life</div>
                  <p className={styles.horoText}>
                    You’re entering a phase of gentle self-reflection — allow one moment of stillness to show what your next step should be.
                  </p>
                </div>
                <div className={styles.horoBlock}>
                  <div className={styles.horoBlockTitle}>Love</div>
                  <p className={styles.horoText}>
                    Small kindnesses carry big meaning today. A heartfelt message or quality time strengthens bonds.
                  </p>
                  <br />
                </div>
                <div className={styles.horoBlock}>
                  <div className={styles.horoBlockTitle}>Health</div>
                  <p className={styles.horoText}>
                    Tune into your body's quieter signals; soft movement or breathwork will recharge more than hustle.
                  </p>
                </div>
              </div>
            </Card>
          </>
        )}

        {tab === "saved" && (
          <Card className={styles.card}>
            <h4 className={styles.sectionTitle}>Saved</h4>
            <p className="small">Your favorite crystals, rituals, and meditations will appear here.</p>
          </Card>
        )}

        {tab === "settings" && (
          <Card className={styles.card}>
            <h4 className={styles.sectionTitle}>Settings</h4>
            <ul className={styles.settingsList}>
              <li>Theme: Celestial</li>
              <li>Notifications: Ritual reminders (coming soon)</li>
              <li>
                Chart:{" "}
                {result ? (
                  <Link to="/chart/result">View current</Link>
                ) : (
                  <Link to="/chart">Create one</Link>
                )}
              </li>
            </ul>
          </Card>
        )}
      </section>
    </div>
  );
}
