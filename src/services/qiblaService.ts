export const KAABA = { latitude: 21.4225, longitude: 39.8262 };

const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

// Arah kiblat dalam derajat dari Utara (searah jarum jam)
export function hitungKiblat(lat: number, lng: number): number {
  const p1 = rad(lat);
  const p2 = rad(KAABA.latitude);
  const dl = rad(KAABA.longitude - lng);
  const y = Math.sin(dl) * Math.cos(p2);
  const x = Math.cos(p1) * Math.sin(p2) - Math.sin(p1) * Math.cos(p2) * Math.cos(dl);
  return (deg(Math.atan2(y, x)) + 360) % 360;
}

export function jarakKeKabah(lat: number, lng: number): number {
  const R = 6371;
  const dLat = rad(KAABA.latitude - lat);
  const dLng = rad(KAABA.longitude - lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat)) * Math.cos(rad(KAABA.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function arahMataAngin(d: number): string {
  const nama = ['Utara', 'Timur Laut', 'Timur', 'Tenggara', 'Selatan', 'Barat Daya', 'Barat', 'Barat Laut'];
  return nama[Math.round(d / 45) % 8];
}

// Titik-titik jalur terpendek (great circle) untuk digambar di peta
export function garisLengkung(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
  n = 64
): [number, number][] {
  const p1 = rad(lat1), l1 = rad(lng1), p2 = rad(lat2), l2 = rad(lng2);
  const d = 2 * Math.asin(
    Math.sqrt(Math.sin((p2 - p1) / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin((l2 - l1) / 2) ** 2)
  );
  if (!isFinite(d) || Math.abs(Math.sin(d)) < 1e-9) {
    return [[lat1, lng1], [lat2, lng2]];
  }

  const out: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const f = i / n;
    const A = Math.sin((1 - f) * d) / Math.sin(d);
    const B = Math.sin(f * d) / Math.sin(d);
    const x = A * Math.cos(p1) * Math.cos(l1) + B * Math.cos(p2) * Math.cos(l2);
    const y = A * Math.cos(p1) * Math.sin(l1) + B * Math.cos(p2) * Math.sin(l2);
    const z = A * Math.sin(p1) + B * Math.sin(p2);
    let lat = deg(Math.atan2(z, Math.sqrt(x * x + y * y)));
    let lng = deg(Math.atan2(y, x));
    if (i > 0) {
      const prev = out[i - 1][1];
      while (lng - prev > 180) lng -= 360;
      while (lng - prev < -180) lng += 360;
    }
    out.push([lat, lng]);
  }
  return out;
}