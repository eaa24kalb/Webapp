import React from "react";
import { NavLink } from "react-router-dom";
import "../App.css";

export default function BottomNav() {
  return (
    <nav className="navBottom" aria-label="Main navigation">
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          isActive ? `navLink navLinkActive` : `navLink`
        }
      >
        <div>🌙</div>
        <div className="small">Home</div>
      </NavLink>

      <NavLink
        to="/horoscope"
        className={({ isActive }) =>
          isActive ? `navLink navLinkActive` : `navLink`
        }
      >
        <div>🔮</div>
        <div className="small">Guide</div>
      </NavLink>

      <NavLink
        to="/chart"
        className={({ isActive }) =>
          isActive ? `navLink navLinkActive` : `navLink`
        }
      >
        <div>🧭</div>
        <div className="small">Birthchart</div>
      </NavLink>

      <NavLink
        to="/profile"
        className={({ isActive }) =>
          isActive ? `navLink navLinkActive` : `navLink`
        }
      >
        <div>👤</div>
        <div className="small">Profile</div>
      </NavLink>
    </nav>
  );
}
