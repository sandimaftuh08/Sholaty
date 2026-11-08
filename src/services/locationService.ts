import * as Location from 'expo-location';

export interface LocationResult {
  city: string;
  name: string;
  region: string;
  latitude: number;
  longitude: number;
}

interface GeocodingResponse {
  results?: {
    name: string;
    latitude: number;
    longitude: number;
    admin1?: string;
    country?: string;
    country_code?: string;
  }[];
}

export async function searchCity(query: string): Promise<LocationResult> {
  const keyword = query.trim();
  if (!keyword) {
    throw new Error('Masukkan nama kota atau kabupaten terlebih dahulu');
  }

  const params = new URLSearchParams({
    name: keyword,
    count: '10',
    language: 'id',
    format: 'json',
  });
  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?${params.toString()}`,
  );

  if (!response.ok) {
    throw new Error('Gagal mencari lokasi. Periksa koneksi internet lalu coba lagi.');
  }

  const data = (await response.json()) as GeocodingResponse;
  const place =
    data.results?.find((result) => result.country_code === 'ID') ??
    data.results?.[0];

  if (!place) {
    throw new Error('Kota tidak ditemukan');
  }

  const region = place.admin1 || place.country || '';
  return {
    city: place.name,
    name: place.name,
    region,
    latitude: place.latitude,
    longitude: place.longitude,
  };
}

export async function getUserLocation(): Promise<LocationResult> {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (permission.status !== 'granted') {
    throw new Error('Izin lokasi ditolak. Izinkan akses lokasi untuk menggunakan GPS.');
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
  const { latitude, longitude } = position.coords;

  let city = 'Lokasi saya';
  let region = '';
  try {
    const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (place) {
      city = place.city || place.subregion || place.district || city;
      region = place.region || place.country || '';
    }
  } catch {
    // Keep coordinates usable even when reverse geocoding is unavailable.
  }

  return { city, name: city, region, latitude, longitude };
}
