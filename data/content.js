export const tripDays = [
  {
    id: "J1",
    dayNumber: 1,
    date: "13 Avril",
    city: "Départ",
    coords: [28.9784, 41.0082],
    subtitle: "Paris → Istanbul",
    transport: "Vol Paris → Istanbul",
    stay: "",
    activities: [
      { name: "Escale à Istanbul", type: "activity", mapQuery: "Istanbul Airport" }
    ],
    alerts: [],
    zoom: 5
  },
  {
    id: "J2",
    dayNumber: 2,
    date: "14 Avril",
    city: "Hanoï",
    coords: [105.8542, 21.0285],
    subtitle: "Arrivée au Vietnam",
    transport: "Vol Istanbul → Hanoï",
    stay: "Aimee House",
    activities: [
      { name: "Lac Hoan Kiem", type: "activity", mapQuery: "Hoan Kiem Lake Hanoi" },
      { name: "Dîner Bun Cha", type: "activity", mapQuery: "Old Quarter Hanoi bun cha" }
    ],
    alerts: [],
    zoom: 11.8
  },
  {
    id: "J3",
    dayNumber: 3,
    date: "15 Avril",
    city: "Hanoï",
    coords: [105.8412, 21.0282],
    subtitle: "Vieille ville & ambiance",
    transport: "",
    stay: "Aimee House",
    activities: [
      { name: "Train Street", type: "activity", mapQuery: "Train Street Hanoi" },
      { name: "Balade dans le vieux Hanoï", type: "activity", mapQuery: "Old Quarter Hanoi" }
    ],
    alerts: [],
    zoom: 12.5
  },
  {
    id: "J4",
    dayNumber: 4,
    date: "16 Avril",
    city: "Ninh Binh",
    coords: [105.8861, 20.2563],
    subtitle: "Nature & bateau",
    transport: "Transfert vers Ninh Binh",
    stay: "Hang Mua",
    activities: [
      { name: "Trang An Boat Tour", type: "activity", mapQuery: "Trang An Boat Tour" }
    ],
    alerts: [],
    zoom: 11.2
  },
  {
    id: "J8",
    dayNumber: 8,
    date: "20 Avril",
    city: "Hoi An",
    coords: [108.3287, 15.8801],
    subtitle: "Lanternes & balade",
    transport: "",
    stay: "Hôtel Hoi An",
    activities: [
      { name: "Hoi An Ancient Town", type: "activity", mapQuery: "Hoi An Ancient Town" }
    ],
    alerts: [],
    zoom: 12.2
  },
  {
    id: "J12",
    dayNumber: 12,
    date: "24 Avril",
    city: "Ho Chi Minh City",
    coords: [106.6990, 10.7798],
    subtitle: "Spot urbain central",
    transport: "",
    stay: "Saigon centre",
    activities: [
      { name: "Saigon Central Post Office", type: "activity", mapQuery: "Saigon Central Post Office" }
    ],
    alerts: [],
    zoom: 12.8
  }
];

export const places = [
  {
    id: "train-street",
    dayId: "J3",
    name: "Train Street Hanoi",
    city: "Hanoï",
    description: "Spot iconique pour café, photo et ambiance urbaine.",
    coordinates: [105.8412, 21.0282],
    category: "Café & photo",
    mapQuery: "Train Street Hanoi"
  },
  {
    id: "trang-an",
    dayId: "J4",
    name: "Trang An Boat Tour",
    city: "Ninh Binh",
    description: "Balade bateau entre reliefs karstiques et rivières de rêve.",
    coordinates: [105.8861, 20.2563],
    category: "Nature",
    mapQuery: "Trang An Boat Tour"
  },
  {
    id: "hoi-an",
    dayId: "J8",
    name: "Hoi An Ancient Town",
    city: "Hoi An",
    description: "Lanternes, ruelles, petites adresses et balade du soir.",
    coordinates: [108.3287, 15.8801],
    category: "Vieille ville",
    mapQuery: "Hoi An Ancient Town"
  },
  {
    id: "saigon-post",
    dayId: "J12",
    name: "Saigon Central Post Office",
    city: "Ho Chi Minh City",
    description: "Un point de départ très central pour rayonner à pied.",
    coordinates: [106.6990, 10.7798],
    category: "Spot urbain",
    mapQuery: "Saigon Central Post Office"
  }
];

export const budgetBlocks = [
  { title: "Vols", value: "€€€", text: "Le gros bloc, posé une bonne fois." },
  { title: "Logements", value: "€€", text: "Confort propre sans tomber dans le trop luxe." },
  { title: "Food & cafés", value: "€", text: "Là, il y a moyen de kiffer vraiment." },
  { title: "Extras", value: "€€", text: "Grab, activités, petits plaisirs sur place." }
];
