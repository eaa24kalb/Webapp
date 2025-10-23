import React from "react";
import { Routes, Route } from "react-router-dom";
import AppShell from "./components/AppShell";
import Home from "./pages/Home";
import Chart from "./pages/Chart";
import ChartResult from "./pages/ChartResult";
import Horoscope from "./pages/Horoscope";
import Profile from "./pages/Profile";
import MoonCalendar from "./pages/MoonCalendar";

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chart" element={<Chart />} />
        <Route path="/chart/result" element={<ChartResult />} />
        <Route path="/horoscope" element={<Horoscope />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/moon" element={<MoonCalendar />} />
        <Route path="*" element={<div style={{ padding: 20 }}>404 — Page not found</div>} />
      </Routes>
    </AppShell>
  );
}
