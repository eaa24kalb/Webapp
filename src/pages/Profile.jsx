// src/pages/Profile.jsx
import React from "react";
import Card from "../components/Card";
import { useFavorites } from "../contexts/FavoritesContext";
import useBirthCalc from "../features/birthchart/useBirthCalc";

export default function Profile() {
  const { items, remove } = useFavorites();
  const { loadLast } = useBirthCalc();
  const last = loadLast();

  return (
    <div>
      <Card>
        <h3 style={{ marginTop: 0 }}>Profile</h3>
        <p className="small">Saved rituals, moon days & crystals for quick access.</p>
      </Card>

      <div style={{ marginTop: 12 }}>
        <Card>
          <h4 style={{ marginTop: 0 }}>Last generated chart</h4>
          {last ? (
            <div>
              <div className="small"><strong>{last.name}</strong> — Sun: {last.sun} • Moon: {last.moon}</div>
              <div style={{ marginTop: 8 }}>
                <button className="button" onClick={() => alert("Open chart detail (TBD)")}>Open</button>
              </div>
            </div>
          ) : (
            <div className="small">No saved chart yet. Generate one in Chart → Calculate birth chart</div>
          )}
        </Card>
      </div>

      <div style={{ marginTop: 12 }}>
        <Card>
          <h4 style={{ marginTop: 0 }}>Favorites</h4>
          {items.length === 0 && <div className="small">You have no favorites yet. Tap the ☆ to save crystals, spells & moon days.</div>}
          <ul style={{ margin: 0, paddingLeft: 16 }}>
            {items.map(item => (
              <li key={item.id} style={{ marginBottom: 8 }}>
                <strong>{item.title || item.name || item.id}</strong>
                <div className="small">{item.type || item.meta?.date || ""}</div>
                <div style={{ marginTop: 6 }}>
                  <button className="button" onClick={() => remove(item.id)}>Remove</button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
