// src/features/birthchart/useLocalChart.js
const FORM_KEY = "celestia.birthForm";
const RESULT_KEY = "celestia.chartResult";

export function loadSavedForm() {
  try { return JSON.parse(localStorage.getItem(FORM_KEY) || "null"); } catch { return null; }
}
export function saveForm(obj) {
  try { localStorage.setItem(FORM_KEY, JSON.stringify(obj)); } catch {}
}

export function loadSavedResult() {
  try { return JSON.parse(localStorage.getItem(RESULT_KEY) || "null"); } catch { return null; }
}
export function saveResult(obj) {
  try { localStorage.setItem(RESULT_KEY, JSON.stringify(obj)); } catch {}
}

export function clearSavedChart() {
  try {
    localStorage.removeItem(FORM_KEY);
    localStorage.removeItem(RESULT_KEY);
  } catch {}
}
