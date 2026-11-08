
export interface PrayerTimes {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

interface AladhanResponse {
  code: number;
  data?: {
    timings?: Partial<PrayerTimes>;
  };
}

function getTimesFromResponse(result: AladhanResponse): PrayerTimes {
  const timings = result.data?.timings;

  if (
    result.code !== 200 ||
    !timings?.Fajr ||
    !timings.Dhuhr ||
    !timings.Asr ||
    !timings.Maghrib ||
    !timings.Isha
  ) {
    throw new Error('Data jadwal salat tidak tersedia');
  }

  return {
    Fajr: timings.Fajr,
    Dhuhr: timings.Dhuhr,
    Asr: timings.Asr,
    Maghrib: timings.Maghrib,
    Isha: timings.Isha,
  };
}

export async function getPrayerTimes(
  city = 'Pekalongan',
  country = 'Indonesia'
): Promise<PrayerTimes> {
  const url =
    `https://api.aladhan.com/v1/timingsByCity` +
    `?city=${encodeURIComponent(city)}` +
    `&country=${encodeURIComponent(country)}` +
    `&method=20`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Gagal mengambil jadwal salat');
  }

  return getTimesFromResponse(await response.json());
}

export async function getPrayerTimesByCoordinates(
  latitude: number,
  longitude: number
): Promise<PrayerTimes> {
  const now = new Date();
  const date = [
    String(now.getDate()).padStart(2, '0'),
    String(now.getMonth() + 1).padStart(2, '0'),
    now.getFullYear(),
  ].join('-');

  const url =
    `https://api.aladhan.com/v1/timings/${date}` +
    `?latitude=${encodeURIComponent(latitude)}` +
    `&longitude=${encodeURIComponent(longitude)}` +
    `&method=20`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Gagal mengambil jadwal salat');
  }

  return getTimesFromResponse(await response.json());
}
