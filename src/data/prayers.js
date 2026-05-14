export const CANONICAL_HOURS = [
  { id: 'matins',   latinName: 'Vigiliae / Matutinum', time: '00:00', hour: 0,  minute: 0, icon: '🌙', color: '#7B68EE', angelus: false },
  { id: 'lauds',    latinName: 'Laudes Matutinae',      time: '06:00', hour: 6,  minute: 0, icon: '🌅', color: '#C9A84C', angelus: true  },
  { id: 'terce',    latinName: 'Hora Tertia',            time: '09:00', hour: 9,  minute: 0, icon: '☀️', color: '#FFB74D', angelus: false },
  { id: 'sext',     latinName: 'Hora Sexta',             time: '12:00', hour: 12, minute: 0, icon: '🌞', color: '#E8C96A', angelus: true  },
  { id: 'none',     latinName: 'Hora Nona',              time: '15:00', hour: 15, minute: 0, icon: '⛅', color: '#4A90D9', angelus: false },
  { id: 'vespers',  latinName: 'Vesperae',               time: '18:00', hour: 18, minute: 0, icon: '🌇', color: '#FF8A65', angelus: true  },
  { id: 'compline', latinName: 'Completorium',           time: '21:00', hour: 21, minute: 0, icon: '🌃', color: '#7B68EE', angelus: false },
];

export const ANGELUS_HOURS = CANONICAL_HOURS.filter(h => h.angelus);
