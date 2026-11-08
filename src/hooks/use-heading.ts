import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

// Membaca arah hadap perangkat (derajat dari Utara). Aktif hanya jika `active` = true.
export function useHeading(active: boolean) {
  const [heading, setHeading] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState(3);
  const [error, setError] = useState('');
  const smooth = useRef<number | null>(null);

  useEffect(() => {
    if (!active) {
      smooth.current = null;
      setHeading(null);
      setError('');
      return;
    }

    setError('');

    const push = (raw: number, acc = 3) => {
      const prev = smooth.current;
      let next = raw;
      if (prev !== null) {
        const d = ((raw - prev + 540) % 360) - 180; // selisih terpendek
        next = (prev + d * 0.25 + 360) % 360; // diperhalus agar tidak bergetar
      }
      smooth.current = next;
      setHeading(next);
      setAccuracy(acc);
    };

    // ---------- WEB ----------
    if (Platform.OS === 'web') {
      let got = false;
      const handler = (e: any) => {
        let h: number | null = null;
        if (typeof e.webkitCompassHeading === 'number') h = e.webkitCompassHeading;
        else if (typeof e.alpha === 'number' && (e.absolute || e.type === 'deviceorientationabsolute')) {
          h = (360 - e.alpha) % 360;
        }
        if (h !== null) {
          got = true;
          push(h);
        }
      };
      window.addEventListener('deviceorientationabsolute', handler as any, true);
      window.addEventListener('deviceorientation', handler as any, true);
      const timer = setTimeout(() => {
        if (!got) {
          setError('Sensor kompas tidak ditemukan di browser/perangkat ini. Gunakan angka arah & peta, atau buka lewat HP.');
        }
      }, 3000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('deviceorientationabsolute', handler as any, true);
        window.removeEventListener('deviceorientation', handler as any, true);
      };
    }

    // ---------- ANDROID / iOS ----------
    let sub: Location.LocationSubscription | undefined;
    let cancelled = false;

    (async () => {
      try {
        sub = await Location.watchHeadingAsync((h) => {
          const raw = h.trueHeading >= 0 ? h.trueHeading : h.magHeading;
          push(raw, h.accuracy);
        });
        if (cancelled) sub.remove();
      } catch {
        setError('Sensor kompas tidak tersedia di perangkat ini.');
      }
    })();

    return () => {
      cancelled = true;
      sub?.remove();
    };
  }, [active]);

  return { heading, accuracy, error };
}