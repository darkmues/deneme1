// Meeus/Jones/Butcher Gregorian Easter algorithm
function calculateEaster(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function fixedFeast(month, day, nameKey, icon) {
  return { type: 'fixed', month, day, nameKey, icon };
}

function easterRelative(offset, nameKey, icon) {
  return { type: 'relative', offset, nameKey, icon };
}

export const FEAST_DEFS = [
  fixedFeast(1,  1,  'feast_mary_mother_god',  '🌟'),
  fixedFeast(1,  6,  'feast_epiphany',          '⭐'),
  fixedFeast(2,  2,  'feast_candlemas',         '🕯️'),
  fixedFeast(3,  19, 'feast_st_joseph',         '⚒️'),
  fixedFeast(3,  25, 'feast_annunciation',      '🕊️'),
  fixedFeast(6,  24, 'feast_john_baptist',      '💧'),
  fixedFeast(6,  29, 'feast_peter_paul',        '⛪'),
  fixedFeast(7,  25, 'feast_st_james',          '🐚'),
  fixedFeast(8,  6,  'feast_transfiguration',   '☀️'),
  fixedFeast(8,  15, 'feast_assumption',        '🌸'),
  fixedFeast(9,  8,  'feast_birth_mary',        '🌹'),
  fixedFeast(9,  14, 'feast_holy_cross',        '✝️'),
  fixedFeast(10, 4,  'feast_st_francis',        '🕊️'),
  fixedFeast(11, 1,  'feast_all_saints',        '🌟'),
  fixedFeast(11, 2,  'feast_all_souls',         '🕯️'),
  fixedFeast(12, 8,  'feast_immaculate',        '💙'),
  fixedFeast(12, 24, 'feast_christmas_eve',     '⭐'),
  fixedFeast(12, 25, 'feast_christmas',         '🎄'),
  fixedFeast(12, 26, 'feast_st_stephen',        '✝️'),
  easterRelative(-46, 'feast_ash_wednesday',   '✝️'),
  easterRelative(-7,  'feast_palm_sunday',      '🌿'),
  easterRelative(-3,  'feast_holy_thursday',    '🍞'),
  easterRelative(-2,  'feast_good_friday',      '✝️'),
  easterRelative(-1,  'feast_holy_saturday',    '🕯️'),
  easterRelative(0,   'feast_easter',           '🌅'),
  easterRelative(1,   'feast_easter_monday',    '🌅'),
  easterRelative(39,  'feast_ascension',        '☁️'),
  easterRelative(49,  'feast_pentecost',        '🔥'),
  easterRelative(56,  'feast_trinity',          '☘️'),
  easterRelative(60,  'feast_corpus_christi',   '🍞'),
];

export function getFeastsForYear(year) {
  const easter = calculateEaster(year);
  const feasts = [];

  for (const def of FEAST_DEFS) {
    let date;
    if (def.type === 'fixed') {
      date = new Date(year, def.month - 1, def.day);
    } else {
      date = addDays(easter, def.offset);
    }
    feasts.push({ date, nameKey: def.nameKey, icon: def.icon });
  }

  return feasts.sort((a, b) => a.date - b.date);
}

export function getUpcomingFeasts(count = 10) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const year = today.getFullYear();
  const allFeasts = [
    ...getFeastsForYear(year),
    ...getFeastsForYear(year + 1),
  ];
  return allFeasts
    .filter(f => f.date >= today)
    .slice(0, count);
}

export function daysUntil(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return Math.round((d - today) / (1000 * 60 * 60 * 24));
}
