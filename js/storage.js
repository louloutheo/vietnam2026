import { APP_CONFIG } from "./config.js";
import { state } from "./state.js";
export function loadStateFromStorage() {
  try {
    const k=APP_CONFIG.storageKeys;
    const trip=localStorage.getItem(k.trip), expenses=localStorage.getItem(k.expenses), checklist=localStorage.getItem(k.checklist), exchangeRate=localStorage.getItem(k.exchangeRate), theme=localStorage.getItem(k.theme);
    if (trip) state.trip = JSON.parse(trip);
    if (expenses) state.expenses = JSON.parse(expenses);
    if (checklist) state.checklist = JSON.parse(checklist);
    if (exchangeRate) state.exchangeRate = parseFloat(exchangeRate) || 27500;
    if (theme) state.theme = theme;
  } catch (e) { console.error("storage load error", e); }
}
export function saveTrip(){localStorage.setItem(APP_CONFIG.storageKeys.trip, JSON.stringify(state.trip))}
export function saveExpenses(){localStorage.setItem(APP_CONFIG.storageKeys.expenses, JSON.stringify(state.expenses))}
export function saveChecklist(){localStorage.setItem(APP_CONFIG.storageKeys.checklist, JSON.stringify(state.checklist))}
export function saveExchangeRate(){localStorage.setItem(APP_CONFIG.storageKeys.exchangeRate, String(state.exchangeRate))}
export function saveTheme(){localStorage.setItem(APP_CONFIG.storageKeys.theme, state.theme)}
