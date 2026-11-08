import * as Location from 'expo-location';

import { loadJson, saveJson } from './storage';

export type SavedLocation = {
  name: string;
  region: string;
  latitude: number;
  longitude: number;
};

const KEY = 'sholaty:location';

export async function getSavedLocation(): Promise<SavedLocation | null> {
  return loadJson<SavedLocation | null>(KEY, null);
}

export async function saveLocation(loc: SavedLocation): Promise<void> {
  await saveJson(KEY, loc);
}

export type GpsResult =
  | { status: 'ok'; location: SavedLocation }
  | { status: 'denied' }
  | { status: 'error' };

/** Ambil lokasi GPS. Izin diminta lewat dialog resmi sistem. Hanya koordinat terakhir yang disimpan. */
export async function getGpsLocation(): Promise<GpsResult> {
  try {
    const perm = await Location.requestForegroundPermissionsAsync();
    if (perm.status !== 'granted') return { status: 'denied' };

    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    const { latitude, longitude } = pos.coords;

    let name = 'Lokasi saya';
    let region = '';
    try {
      const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (place) {
        name = place.city || place.subregion || place.district || place.name || name;
        region = place.region || '';
      }
    } catch {
      // reverse geocode tidak tersedia (mis. offline / web): pakai nama default
    }

    const location = { name, region, latitude, longitude };
    await saveLocation(location);
    return { status: 'ok', location };
  } catch {
    return { status: 'error' };
  }
}