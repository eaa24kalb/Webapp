import React from "react";
import { Routes, Route, Navigate } from "react-router-dom"; // ⬅️ add Navigate
import AppShell from "./components/AppShell";
import Home from "./pages/Home";
import Chart from "./pages/Chart";
import ChartResult from "./pages/ChartResult";
import Error404 from "./pages/Error404.jsx";
import Profile from "./pages/Profile";
import MoonCalendar from "./pages/MoonCalendar";

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chart" element={<Chart />} />
        <Route path="/chart/result" element={<ChartResult />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/moon" element={<MoonCalendar />} />

        {/* give 404 a real path */}
        <Route path="/404" element={<Error404 />} />

        {/* redirect any unknown route to /404 */}
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </AppShell>
  );
}