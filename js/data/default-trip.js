export const DEFAULT_TRIP = [
  {
    jour: 1,
    date: "13 Avril",
    ville: "Départ",
    lat: 41.0082,
    lon: 28.9784,
    zoomMap: 8000000,
    transport: "Vol Paris -> Istanbul",
    logements: [],
    activites: [
      { nom: "Escale à Istanbul", lien: "", periode: "aprem" }
    ],
    alerts: [],
    journal: { stars: 0, text: "" }
  },
  {
    jour: 2,
    date: "14 Avril",
    ville: "Hanoï",
    lat: 21.0285,
    lon: 105.8542,
    zoomMap: 60000,
    transport: "Vol Istanbul -> Hanoï",
    logements: [{ nom: "Aimee House", lien: "" }],
    activites: [
      { nom: "Lac Hoan Kiem", lien: "", periode: "aprem" },
      { nom: "Dîner Bun Cha", lien: "", periode: "soir" }
    ],
    alerts: [],
    journal: { stars: 0, text: "" }
  },
  {
    jour: 3,
    date: "15 Avril",
    ville: "Hanoï",
    lat: 21.0285,
    lon: 105.8542,
    zoomMap: 60000,
    transport: "",
    logements: [{ nom: "Aimee House", lien: "" }],
    activites: [
      { nom: "Vieux Hanoï", lien: "", periode: "matin" },
      { nom: "Train Street", lien: "", periode: "aprem" }
    ],
    alerts: [],
    journal: { stars: 0, text: "" }
  },
  {
    jour: 4,
    date: "16 Avril",
    ville: "Ninh Binh",
    lat: 20.2539,
    lon: 105.98,
    zoomMap: 80000,
    transport: "Bus 12GO (Matin)",
    logements: [{ nom: "Hang Mua", lien: "" }],
    activites: [
      { nom: "Barque Trang An", lien: "", periode: "matin" },
      { nom: "Coucher soleil", lien: "", periode: "aprem" }
    ],
    alerts: [],
    journal: { stars: 0, text: "" }
  },
  {
    jour: 5,
    date: "17 Avril",
    ville: "Ninh Binh -> Pu Luong",
    lat: 20.4533,
    lon: 105.228,
    zoomMap: 90000,
    transport: "Transfert Van",
    logements: [{ nom: "Réserve Pu Luong", lien: "" }],
    activites: [
      { nom: "Arrivée jungle", lien: "", periode: "aprem" }
    ],
    alerts: [],
    journal: { stars: 0, text: "" }
  },
  {
    jour: 6,
    date: "18 Avril",
    ville: "Pu Luong",
    lat: 20.4533,
    lon: 105.228,
    zoomMap: 70000,
    transport: "",
    logements: [{ nom: "Réserve Pu Luong", lien: "" }],
    activites: [
      { nom: "Trek Rizières", lien: "", periode: "matin" }
    ],
    alerts: [],
    journal: { stars: 0, text: "" }
  },
  {
    jour: 7,
    date: "19 Avril",
    ville: "Lan Ha",
    lat: 20.728,
    lon: 107.05,
    zoomMap: 120000,
    transport: "Transfert Baie",
    logements: [{ nom: "Bateau", lien: "" }],
    activites: [
      { nom: "Kayak", lien: "", periode: "aprem" }
    ],
    alerts: ["Payer solde"],
    journal: { stars: 0, text: "" }
  },
  {
    jour: 8,
    date: "20 Avril",
    ville: "Train de Nuit",
    lat: 21.0285,
    lon: 105.8542,
    zoomMap: 200000,
    transport: "Train Hanoï -> Hué",
    logements: [{ nom: "Cabine", lien: "" }],
    activites: [
      { nom: "Retour croisière", lien: "", periode: "matin" }
    ],
    alerts: [],
    journal: { stars: 0, text: "" }
  },
  {
    jour: 9,
    date: "21 Avril",
    ville: "Hué",
    lat: 16.4637,
    lon: 107.5909,
    zoomMap: 60000,
    transport: "Arrivée (Matin)",
    logements: [{ nom: "Hôtel Hué", lien: "" }],
    activites: [
      { nom: "Cité Impériale", lien: "", periode: "matin" }
    ],
    alerts: [],
    journal: { stars: 0, text: "" }
  },
  {
    jour: 10,
    date: "22 Avril",
    ville: "Hoi An",
    lat: 15.8801,
    lon: 108.338,
    zoomMap: 150000,
    transport: "Voiture Col Nuages",
    logements: [{ nom: "Hôtel", lien: "" }],
    activites: [
      { nom: "Hoi An nuit", lien: "", periode: "soir" }
    ],
    alerts: ["Réserver bateau"],
    journal: { stars: 0, text: "" }
  },
  {
    jour: 11,
    date: "23 Avril",
    ville: "Hoi An",
    lat: 15.8801,
    lon: 108.338,
    zoomMap: 40000,
    transport: "Scooter / Vélo",
    logements: [{ nom: "Hôtel Hoi An", lien: "" }],
    activites: [
      { nom: "Plage An Bang", lien: "", periode: "aprem" }
    ],
    alerts: [],
    journal: { stars: 0, text: "" }
  },
  {
    jour: 12,
    date: "24 Avril",
    ville: "Îles Cham",
    lat: 15.959,
    lon: 108.523,
    zoomMap: 50000,
    transport: "Bateau Rapide",
    logements: [{ nom: "Homestay", lien: "" }],
    activites: [
      { nom: "Snorkeling", lien: "", periode: "matin" }
    ],
    alerts: [],
    journal: { stars: 0, text: "" }
  },
  {
    jour: 13,
    date: "25 Avril",
    ville: "Da Nang",
    lat: 16.0544,
    lon: 108.2022,
    zoomMap: 90000,
    transport: "Bateau + Voiture",
    logements: [{ nom: "Hôtel Da Nang", lien: "" }],
    activites: [
      { nom: "Pont Dragon", lien: "", periode: "soir" }
    ],
    alerts: [],
    journal: { stars: 0, text: "" }
  },
  {
    jour: 14,
    date: "26 Avril",
    ville: "Da Nang",
    lat: 16.0544,
    lon: 108.2022,
    zoomMap: 80000,
    transport: "",
    logements: [{ nom: "Hôtel Da Nang", lien: "" }],
    activites: [
      { nom: "Lady Buddha", lien: "", periode: "matin" }
    ],
    alerts: [],
    journal: { stars: 0, text: "" }
  },
  {
    jour: 15,
    date: "27 Avril",
    ville: "Départ",
    lat: 16.0544,
    lon: 108.2022,
    zoomMap: 8000000,
    transport: "Vol Da Nang -> Istanbul",
    logements: [],
    activites: [
      { nom: "Achats", lien: "", periode: "matin" }
    ],
    alerts: [],
    journal: { stars: 0, text: "" }
  },
  {
    jour: 16,
    date: "28 Avril",
    ville: "France",
    lat: 48.8566,
    lon: 2.3522,
    zoomMap: 8000000,
    transport: "Vol Istanbul -> Paris",
    logements: [],
    activites: [
      { nom: "Arrivée à la maison", lien: "", periode: "aprem" }
    ],
    alerts: [],
    journal: { stars: 0, text: "" }
  }
];