// Simple reusable wrapper component for consistent card styling

import React from "react";
import "../App.css";

export default function Card({ children, className = "" }) {
  return <div className={`card ${className}`.trim()}>{children}</div>;
}
