// src/components/AppShell.jsx
import React from "react";
import { useLocation } from "react-router-dom";
import BottomNav from "./BottomNav";
import Avatar1 from "../assets/images/Avatar1.png";
import "../App.css";

function getGreeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return "Good Morning,";
  if (hour < 18) return "Good Afternoon,";
  return "Good Evening,";
}

function formatLongDate(date = new Date()) {
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export default function AppShell({ children }) {
  const now = new Date();
  const greeting = getGreeting(now);
  const longDate = formatLongDate(now);
  const location = useLocation();

  // ✅ Only show header on the Home route
  const isHome = location.pathname === "/";
  const showHeader = isHome;

  // ✅ Make every non-home page full-bleed
  const isFullBleed = !isHome;

  return (
    <div className="appContainer">
      {showHeader && (
        <header className="header">
          <div className="headerText">
            <div className="greeting">{greeting}</div>
            <div className="userName">Luna</div>
            <div className="date">{longDate}</div>
          </div>

          <div className="avatarWrapper">
            <img src={Avatar1} alt="Luna" className="avatarImg" />
          </div>
        </header>
      )}

      <main className={`content ${isFullBleed ? "contentFull" : ""}`}>
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
