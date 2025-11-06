// Home main page 

import React from "react";
import { Link } from "react-router-dom";
import Card from "../components/Card";
import MoonCard from "../features/moon/MoonCard";
import styles from "../styles/Home.module.css";

// Avatar images
import Avatar2 from "../assets/images/Avatar2.png";
import Avatar3 from "../assets/images/Avatar3.png";
import Avatar4 from "../assets/images/Avatar4.png";


export default function Home() {

  // Community
  const community = [
    {
      id: "1",
      name: "Alissa",
      handle: "@alissaeagan222",
      sign: "♊ Gemini",
      avatar: Avatar2, 
      snippet:
        "You and Alissa are a passionate & generative match. You share a straight-forward attitude and a drive to do what feels right in the moment.",
    },
    {
      id: "2",
      name: "Magnus",
      handle: "@mmalthanl",
      sign: "♍ Virgo",
      avatar: Avatar3,
      snippet:
        "Magnus is leaving a period of isolation. Magnus’ day at a glance: Your love is one for the books.",
    },
    {
      id: "3",
      name: "Maria",
      handle: "@mariania766",
      sign: "♌ Scorpio",
      avatar: Avatar4,
      snippet:
        "Maria won the award for most costume changes in one minute. You also won the award for most costume changes in one minute.",
    },
  ];

  return (
    <div className={styles.page}>
      {/* Moon mini widget */}
      <section aria-label="Moon overview" className={styles.section}>
        <MoonCard />
      </section>

      {/* Your day at a glance */}
      <section className={styles.section}>
         <h3 className={styles.sectionTitle}>Your day at a glance…</h3>
        <Card className={styles.glanceCard}>

          <p className={styles.glanceQuote}>
            <i><b>Your beautiful heart will bring you beautiful things.</b></i>
          </p>
<br />
          <div className={styles.doDont}>
            <div>
              <div className={styles.doDontTitle}>Do</div>
              <ul className={styles.list}>
                <li>Clarification</li>
                <li>Lava lamps</li>
                <li>Airplane mode</li>
              </ul>
            </div>
            <div>
              <div className={styles.doDontTitle}>Don’t</div>
              <ul className={styles.list}>
                <li>Tense shoulders</li>
                <li>Spam</li>
                <li>Play yourself</li>
              </ul>
            </div>
          </div>

          <div className={styles.glanceFooter}>
            <div className={styles.zodiacRow} aria-hidden>
              <span>♊</span>
              <span>♋</span>
              <span>♌</span>
              <span>♍</span>
            </div>
            <Link to="/chart" className={styles.readMoreBtn}>
              Read more
            </Link>
          </div>
        </Card>
      </section>

      {/* Community feed */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Community</h3>
          <div className={styles.headerActions} aria-hidden>
            <button className={styles.arrowBtn} type="button" tabIndex={-1}>←</button>
            <button className={styles.arrowBtn} type="button" tabIndex={-1}>→</button>
          </div>
        </div>

        <div className={styles.feed}>
          {community.map(item => (
            <Card key={item.id} className={styles.feedCard}>
              <div className={styles.feedHeader}>
                 <img
                  src={item.avatar}
                  alt={`${item.name} avatar`}
                  className={styles.avatar}
                />
                <div className={styles.identity}>
                  <div className={styles.nameRow}>
                    <span className={styles.name}>{item.name}</span>
                    <span className={styles.sign}>{item.sign}</span>
                  </div>
                  <div className={styles.handle}>{item.handle}</div>
                </div>
                <Link to="/profile" className={styles.chevronBtn} aria-label={`Open ${item.name} profile`}>
                  →
                </Link>
              </div>

              <p className={styles.snippet}>{item.snippet}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
