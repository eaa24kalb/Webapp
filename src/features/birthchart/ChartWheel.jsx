import React from "react";
import styles from "../../styles/ChartWheel.module.css";

const SIGNS = [
  "Aries","Taurus","Gemini","Cancer","Leo","Virgo",
  "Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"
];

const SIGN_SYMBOL = {
  Aries: "♈", Taurus: "♉", Gemini: "♊", Cancer: "♋", Leo: "♌", Virgo: "♍",
  Libra: "♎", Scorpio: "♏", Sagittarius: "♐", Capricorn: "♑", Aquarius: "♒", Pisces: "♓"
};

const PLANET_SYMBOL = {
  Sun: "☉", Moon: "☽", Mercury: "☿", Venus: "♀", Mars: "♂",
  Jupiter: "♃", Saturn: "♄", Uranus: "⛢", Neptune: "♆", Pluto: "♇",
};

function lonFrom(sign, degree = 0) {
  const idx = SIGNS.indexOf(sign);
  if (idx < 0) return null;
  return (idx * 30 + (Number(degree) || 0)) % 360;
}
function thetaFromLon(lon) {
  const deg = 90 - lon; // 0° at right
  return (deg * Math.PI) / 180;
}

export default function ChartWheel({ result, size = 360 }) {
  const cx = size / 2;
  const cy = size / 2;
  const R_outer = size * 0.48;
  const R_signs = size * 0.40;
  const R_planets = size * 0.32;
  const R_houses = size * 0.28;

  const houses = Array.isArray(result?.houses) ? result.houses : [];
  const planets = Array.isArray(result?.planets) ? result.planets : [];

  const P = planets
    .map(p => {
      const lon = p.sign ? lonFrom(p.sign, p.degree) : null;
      return lon == null ? null : { ...p, lon, symbol: PLANET_SYMBOL[p.body] || p.body?.[0] || "●" };
    })
    .filter(Boolean);

  const signSectors = SIGNS.map((s, i) => {
    const mid = i * 30 + 15;
    const t = thetaFromLon(mid);
    return { sign: s, t, x: cx + Math.cos(t) * R_signs, y: cy - Math.sin(t) * R_signs };
  });

  const houseLines = houses.map(h => {
    const lon = (Number(h.cusp) || 0) % 360;
    const t = thetaFromLon(lon);
    return {
      t,
      x2: cx + Math.cos(t) * R_outer,
      y2: cy - Math.sin(t) * R_outer,
      num: h.house
    };
  });

  return (
    <div className={styles.wrap} style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className={styles.svg} aria-label="Natal chart wheel">
        <circle cx={cx} cy={cy} r={R_outer} className={styles.ringOuter} />
        <circle cx={cx} cy={cy} r={R_signs} className={styles.ringSigns} />
        <circle cx={cx} cy={cy} r={R_planets - 10} className={styles.ringInner} />

        {/* sign dividers */}
        {SIGNS.map((_, i) => {
          const t = thetaFromLon(i * 30);
          const x1 = cx + Math.cos(t) * (R_signs + 2);
          const y1 = cy - Math.sin(t) * (R_signs + 2);
          const x2 = cx + Math.cos(t) * (R_outer - 2);
          const y2 = cy - Math.sin(t) * (R_outer - 2);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} className={styles.signLine} />;
        })}

        {/* sign labels */}
        {signSectors.map(({ sign, x, y }) => (
          <text key={sign} x={x} y={y} className={styles.signLabel}>{SIGN_SYMBOL[sign]}</text>
        ))}

        {/* house lines & numbers */}
        {houseLines.map((h, i) => (
          <g key={i}>
            <line x1={cx} y1={cy} x2={h.x2} y2={h.y2} className={styles.houseLine} />
            <text
              x={cx + Math.cos(h.t) * (R_houses - 12)}
              y={cy - Math.sin(h.t) * (R_houses - 12)}
              className={styles.houseNum}
            >
              {h.num}
            </text>
          </g>
        ))}

        {/* planets */}
        {P.map((p, idx) => {
          const t = thetaFromLon(p.lon);
          const px = cx + Math.cos(t) * R_planets;
          const py = cy - Math.sin(t) * R_planets;
          return (
            <g key={p.body || idx} className={styles.planet}>
              <circle cx={px} cy={py} r="5" className={styles.planetDot} />
              <text x={px + 8} y={py + 4} className={styles.planetLabel}>{p.symbol}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
