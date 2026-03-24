import { APP_CONFIG } from "./config.js";
import { state } from "./state.js";

export function loadStateFromStorage() {
  try {
    const trip = localStorage.getItem(APP_CONFIG.storageKeys.trip);
    const expenses = localStorage.getItem(APP_CONFIG.storageKeys.expenses);
    const checklist = localStorage.getItem(APP_CONFIG.storageKeys.checklist);
    const exchangeRate = localStorage.getItem(APP_CONFIG.storageKeys.exchangeRate);
    const theme = localStorage.getItem(APP_CONFIG.storageKeys.theme);

    if (trip) state.trip = JSON.parse(trip);
    if (expenses) state.expenses = JSON.parse(expenses);
    if (checklist) state.checklist = JSON.parse(checklist);
    if (exchangeRate) state.exchangeRate = parseFloat(exchangeRate) || 27500;
    if (theme) state.theme = theme;
  } catch (error) {
    console.error("Erreur chargement stockage local :", error);
  }
}

export function saveTrip() {
  localStorage.setItem(APP_CONFIG.storageKeys.trip, JSON.stringify(state.trip));
}

export function saveExpenses() {
  localStorage.setItem(APP_CONFIG.storageKeys.expenses, JSON.stringify(state.expenses));
}

export function saveChecklist() {
  localStorage.setItem(APP_CONFIG.storageKeys.checklist, JSON.stringify(state.checklist));
}

export function saveExchangeRate() {
  localStorage.setItem(APP_CONFIG.storageKeys.exchangeRate, String(state.exchangeRate));
}

export function saveTheme() {
  localStorage.setItem(APP_CONFIG.storageKeys.theme, state.theme);
}