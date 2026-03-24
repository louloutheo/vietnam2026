import { DEFAULT_TRIP } from "./data/default-trip.js";

export const state = {
  currentDayIdx: 0,
  activeView: "view-etapes",
  theme: "dark",
  trip: structuredClone(DEFAULT_TRIP),
  expenses: [],
  checklist: [
    { t: "Passeports & Visas", c: false },
    { t: "Permis de Conduire", c: false },
    { t: "Répulsif Moustique", c: false }
  ],
  exchangeRate: 27500,
  weatherCache: {}
};
