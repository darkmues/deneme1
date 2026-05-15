export const CANONICAL_HOURS = [
  { id: 'matins',   latinName: 'Vigiliae / Matutinum', time: '00:00', hour: 0,  minute: 0, icon: '🌙', color: '#7B68EE', angelus: false },
  { id: 'lauds',    latinName: 'Laudes Matutinae',      time: '06:00', hour: 6,  minute: 0, icon: '🌅', color: '#C9A84C', angelus: true  },
  { id: 'terce',    latinName: 'Hora Tertia',            time: '09:00', hour: 9,  minute: 0, icon: '☀️', color: '#FFB74D', angelus: false },
  { id: 'sext',     latinName: 'Hora Sexta',             time: '12:00', hour: 12, minute: 0, icon: '🌞', color: '#E8C96A', angelus: true  },
  { id: 'none',     latinName: 'Hora Nona',              time: '15:00', hour: 15, minute: 0, icon: '⛅', color: '#4A90D9', angelus: false },
  { id: 'vespers',  latinName: 'Vesperae',               time: '18:00', hour: 18, minute: 0, icon: '🌇', color: '#FF8A65', angelus: true  },
  { id: 'compline', latinName: 'Completorium',           time: '21:00', hour: 21, minute: 0, icon: '🌃', color: '#7B68EE', angelus: false },
];

export const ORTHODOX_HOURS = [
  { id: 'midnight_office', latinName: 'Mesonyktikon',  time: '00:00', hour: 0,  minute: 0, icon: '🌙', color: '#7B68EE', angelus: false },
  { id: 'orthros',         latinName: 'Orthros',        time: '06:00', hour: 6,  minute: 0, icon: '🌅', color: '#C9A84C', angelus: false },
  { id: 'first_hour',      latinName: 'Hora Prima',     time: '07:00', hour: 7,  minute: 0, icon: '🌤', color: '#FFB74D', angelus: false },
  { id: 'third_hour',      latinName: 'Hora Tertia',    time: '09:00', hour: 9,  minute: 0, icon: '☀️', color: '#E8C96A', angelus: false },
  { id: 'sixth_hour',      latinName: 'Hora Sexta',     time: '12:00', hour: 12, minute: 0, icon: '🌞', color: '#E8C96A', angelus: false },
  { id: 'ninth_hour',      latinName: 'Hora Nona',      time: '15:00', hour: 15, minute: 0, icon: '⛅', color: '#4A90D9', angelus: false },
  { id: 'vespers_ox',      latinName: 'Esperinos',      time: '18:00', hour: 18, minute: 0, icon: '🌇', color: '#FF8A65', angelus: false },
  { id: 'compline_ox',     latinName: 'Apodeipnon',     time: '21:00', hour: 21, minute: 0, icon: '🌃', color: '#7B68EE', angelus: false },
];

export const PROTESTANT_HOURS = [
  { id: 'morning_prot',   latinName: 'Morning Prayer',   time: '07:00', hour: 7,  minute: 0, icon: '🌅', color: '#C9A84C', angelus: false },
  { id: 'noon_prot',      latinName: 'Noon Prayer',       time: '12:00', hour: 12, minute: 0, icon: '🌞', color: '#E8C96A', angelus: false },
  { id: 'afternoon_prot', latinName: 'Afternoon Prayer',  time: '15:00', hour: 15, minute: 0, icon: '⛅', color: '#4A90D9', angelus: false },
  { id: 'evening_prot',   latinName: 'Evening Prayer',    time: '18:00', hour: 18, minute: 0, icon: '🌇', color: '#FF8A65', angelus: false },
  { id: 'night_prot',     latinName: 'Night Prayer',      time: '21:00', hour: 21, minute: 0, icon: '🌃', color: '#7B68EE', angelus: false },
];

export function getHoursForDenomination(denomination) {
  if (denomination === 'orthodox')   return ORTHODOX_HOURS;
  if (denomination === 'protestant') return PROTESTANT_HOURS;
  return CANONICAL_HOURS;
}

export const ANGELUS_HOURS = CANONICAL_HOURS.filter(h => h.angelus);
