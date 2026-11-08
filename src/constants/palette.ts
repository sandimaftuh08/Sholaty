export const C = {
  deep: '#0A3B2B',
  green: '#165941',
  greenSoft: '#E1EDE6',
  gold: '#C9A24B',
  goldSoft: '#F3E3B3',
  cream: '#FAF5E8',
  creamDeep: '#F3EBD6',
  card: '#FFFFFF',
  border: '#EBD9A8',
  text: '#0B4A33',
  muted: '#6B7F76',
  danger: '#B3402F',
} as const;

export type PrayerKey = 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';

export const PRAYERS: { key: PrayerKey; nama: string; arab: string; icon: string }[] = [
  { key: 'Fajr', nama: 'Subuh', arab: 'الفجر', icon: '🌙' },
  { key: 'Dhuhr', nama: 'Dzuhur', arab: 'الظهر', icon: '☀️' },
  { key: 'Asr', nama: 'Ashar', arab: 'العصر', icon: '⛅' },
  { key: 'Maghrib', nama: 'Maghrib', arab: 'المغرب', icon: '🌇' },
  { key: 'Isha', nama: 'Isya', arab: 'العشاء', icon: '🌌' },
];

export const MAX_WIDTH = 720;