import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { PrayerKey } from '@/constants/palette';
import { loadJson, saveJson } from './storage';

export type Settings = {
  /** ID metode perhitungan Aladhan (20 = Kemenag RI) */
  method: number;
  notifEnabled: boolean;
  /** pengingat per waktu sholat */
  prayers: Record<PrayerKey, boolean>;
  /** berapa menit sebelum adzan notifikasi muncul (0 = tepat waktu) */
  leadMinutes: number;
};

export const DEFAULT_SETTINGS: Settings = {
  method: 20,
  notifEnabled: false,
  prayers: { Fajr: true, Dhuhr: true, Asr: true, Maghrib: true, Isha: true },
  leadMinutes: 0,
};

export const CALC_METHODS = [
  { id: 20, nama: 'Kemenag RI', ket: 'Acuan umum di Indonesia' },
  { id: 3, nama: 'Muslim World League', ket: 'Liga Muslim Dunia' },
  { id: 2, nama: 'ISNA', ket: 'Islamic Society of North America' },
  { id: 4, nama: 'Umm al-Qura', ket: 'Makkah, Arab Saudi' },
  { id: 5, nama: 'Egyptian General Authority', ket: 'Mesir' },
  { id: 1, nama: 'University of Islamic Sciences, Karachi', ket: 'Pakistan' },
  { id: 17, nama: 'JAKIM', ket: 'Malaysia' },
  { id: 11, nama: 'MUIS', ket: 'Singapura' },
];

const KEY = 'sholaty:settings';

export async function getSettings(): Promise<Settings> {
  const saved = await loadJson<Partial<Settings>>(KEY, {});
  return {
    ...DEFAULT_SETTINGS,
    ...saved,
    prayers: { ...DEFAULT_SETTINGS.prayers, ...(saved.prayers ?? {}) },
  };
}

export async function saveSettings(next: Settings): Promise<void> {
  await saveJson(KEY, next);
}

/** Hook: memuat pengaturan setiap layar mendapat fokus. */
export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getSettings().then((s) => {
        if (active) {
          setSettings(s);
          setReady(true);
        }
      });
      return () => {
        active = false;
      };
    }, []),
  );

  const update = useCallback(async (patch: Partial<Settings>) => {
    let merged: Settings = DEFAULT_SETTINGS;
    setSettings((prev) => {
      merged = { ...prev, ...patch };
      return merged;
    });
    await saveSettings(merged);
    return merged;
  }, []);

  return { settings, update, ready };
}