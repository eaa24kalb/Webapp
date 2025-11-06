// Helpers to persist the birth form and the last chart result to localStorage.

const FORM_KEY = "celestia.birthForm";
const RESULT_KEY = "celestia.chartResult";

// Load the previously saved birth form (or null)
export function loadSavedForm() {
  try { return JSON.parse(localStorage.getItem(FORM_KEY) || "null"); } catch { return null; }
}

// Save birth form inputs (name, date, time, city)
export function saveForm(obj) {
  try { localStorage.setItem(FORM_KEY, JSON.stringify(obj)); } catch {}
}

// Load the last computed chart result (or null)
export function loadSavedResult() {
  try { return JSON.parse(localStorage.getItem(RESULT_KEY) || "null"); } catch { return null; }
}
export function saveResult(obj) {
  try { localStorage.setItem(RESULT_KEY, JSON.stringify(obj)); } catch {}
}

// Clear both form + result (used by settings or reset flows)
export function clearSavedChart() {
  try {
    localStorage.removeItem(FORM_KEY);
    localStorage.removeItem(RESULT_KEY);
  } catch {}
}
