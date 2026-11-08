import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { searchCity as cariKota, getUserLocation } from '../services/locationService';
import {
  getPrayerTimes,
  getPrayerTimesByCoordinates,
  PrayerTimes,
} from '../services/prayerApi';

const daftarSholat = [
  { nama: 'Subuh', arab: 'الفجر', key: 'Fajr', emoji: '🌙' },
  { nama: 'Dzuhur', arab: 'الظهر', key: 'Dhuhr', emoji: '☀️' },
  { nama: 'Ashar', arab: 'العصر', key: 'Asr', emoji: '🌤️' },
  { nama: 'Maghrib', arab: 'المغرب', key: 'Maghrib', emoji: '🌅' },
  { nama: 'Isya', arab: 'العشاء', key: 'Isha', emoji: '🌌' },
] as const;

const WARNA = {
  hijauTua: '#0B3D2E',
  hijau: '#14573F',
  hijauMuda: '#E6F0EA',
  emas: '#C9A24B',
  emasMuda: '#E8D3A0',
  krem: '#FAF6EC',
  putih: '#FFFFFF',
  teks: '#12352A',
  teksLembut: '#5F7A6E',
  error: '#B3382C',
};

// "04:32" atau "04:32 (WIB)" -> menit sejak tengah malam
function keMenit(jam?: string | null): number | null {
  if (!jam) return null;
  const m = jam.match(/(\d{1,2}):(\d{2})/);
  if (!m) return null;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}

function hitungBerikutnya(times: PrayerTimes | null, now: Date) {
  if (!times) return null;
  const sekarang = now.getHours() * 60 + now.getMinutes();

  const jadwal = daftarSholat
    .map((s) => ({ ...s, menit: keMenit(times[s.key]) }))
    .filter((s): s is typeof s & { menit: number } => s.menit !== null);

  if (jadwal.length === 0) return null;

  let target = jadwal.find((s) => s.menit > sekarang);
  let selisih: number;

  if (target) {
    selisih = target.menit - sekarang;
  } else {
    target = jadwal[0];
    selisih = 24 * 60 - sekarang + target.menit;
  }

  const jam = Math.floor(selisih / 60);
  const menit = selisih % 60;
  const teks = jam > 0 ? `${jam} jam ${menit} menit lagi` : `${menit} menit lagi`;

  return { ...target, teks };
}



export default function HomeScreen() {
  const [city, setCity] = useState('Pekalongan');
  const [searchCity, setSearchCity] = useState('');
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  const berikutnya = useMemo(
    () => hitungBerikutnya(prayerTimes, now),
    [prayerTimes, now]
  );

  async function loadPrayerTimes(cityName: string) {
    try {
      setLoading(true);
      setError('');

      const result = await getPrayerTimes(cityName, 'Indonesia');

      setPrayerTimes(result);
      setCity(cityName);
      setSearchCity('');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Gagal mengambil jadwal salat'
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch() {
    const keyword = searchCity.trim();

    if (!keyword) {
      setError('Masukkan nama kota atau kabupaten terlebih dahulu');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const kota = await cariKota(keyword);
      const result = await getPrayerTimesByCoordinates(
        kota.latitude,
        kota.longitude
      );
      setPrayerTimes(result);
      setCity(kota.region ? `${kota.name}, ${kota.region}` : kota.name);
      setSearchCity('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mencari lokasi');
    } finally {
      setLoading(false);
    }
  }

  async function handleGPS() {
    try {
      setLoading(true);
      setError('');

      const location = await getUserLocation();
      const result = await getPrayerTimesByCoordinates(
        location.latitude,
        location.longitude
      );
      setPrayerTimes(result);
            setCity(location.city);
      setSearchCity('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mendeteksi lokasi');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPrayerTimes('Pekalongan');
  }, []);

  const tanggal = now.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        style={{ backgroundColor: WARNA.krem }}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.bismillah}>بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ</Text>
          <View style={styles.ornamenBaris}>
            <View style={styles.garisEmas} />
            <Text style={styles.ornamen}>✦</Text>
            <View style={styles.garisEmas} />
          </View>
          <Text style={styles.logo}>Sholaty</Text>
          <Text style={styles.sapaan}>Assalamu'alaikum</Text>
          <Text style={styles.subsapaan}>Yuk, jaga sholat hari ini</Text>
          <Text style={styles.tanggal}>{tanggal}</Text>
        </View>

        {/* KARTU UTAMA */}
        <View style={styles.kartuUtamaLuar}>
          <View style={styles.kartuUtama}>
            <Text style={styles.ornamenKecil}>۞</Text>
            <Text style={styles.label}>SHOLAT BERIKUTNYA</Text>

            <Text style={styles.namaSholat}>
              {berikutnya ? berikutnya.nama : '—'}
            </Text>
            <Text style={styles.namaArab}>
              {berikutnya ? berikutnya.arab : ''}
            </Text>

            <Text style={styles.waktuBesar}>
              {berikutnya
                ? prayerTimes?.[berikutnya.key]?.slice(0, 5) || '--:--'
                : '--:--'}
            </Text>

            <View style={styles.pil}>
              <Text style={styles.pilTeks}>
                {berikutnya ? berikutnya.teks : 'Memuat jadwal...'}
              </Text>
            </View>

            <Text style={styles.kotaKartu}>📍 {city}</Text>
          </View>
        </View>

        {/* PENCARIAN LOKASI */}
        <View style={styles.kartuLokasi}>
          <Text style={styles.judulLokasi}>Lokasi Jadwal Salat</Text>
          <Text style={styles.lokasiAktif}>Saat ini: {city}</Text>

          <TextInput
            style={styles.input}
            placeholder="Cari kota atau kabupaten..."
            placeholderTextColor="#8AA398"
            value={searchCity}
            onChangeText={setSearchCity}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />

          <TouchableOpacity
            style={styles.tombolCari}
            onPress={handleSearch}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.teksTombol}>Cari Lokasi</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tombolGPS}
            onPress={handleGPS}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.teksTombolGPS}>
              📍 Gunakan Lokasi Saya (GPS)
            </Text>
          </TouchableOpacity>

          {loading && (
            <ActivityIndicator
              size="large"
              color={WARNA.hijau}
              style={{ marginTop: 15 }}
            />
          )}

          {!!error && <Text style={styles.error}>{error}</Text>}
        </View>

        {/* DAFTAR JADWAL */}
        <View style={styles.judulBaris}>
          <View style={styles.garisJudul} />
          <Text style={styles.judul}>Jadwal Sholat Hari Ini</Text>
          <View style={styles.garisJudul} />
        </View>

        {daftarSholat.map((item) => {
          const aktif = berikutnya?.key === item.key;
          return (
            <View
              style={[styles.kartuSholat, aktif && styles.kartuSholatAktif]}
              key={item.nama}
            >
              <View style={[styles.lingkaran, aktif && styles.lingkaranAktif]}>
                <Text style={styles.emojiKecil}>{item.emoji}</Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={[styles.namaKecil, aktif && styles.teksAktif]}>
                  {item.nama}
                </Text>
                <Text style={[styles.arabKecil, aktif && styles.arabAktif]}>
                  {item.arab}
                </Text>
              </View>

              <Text style={[styles.jam, aktif && styles.jamAktif]}>
                {prayerTimes?.[item.key]?.slice(0, 5) || '--:--'}
              </Text>
            </View>
          );
        })}

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.ornamen}>✦ ۞ ✦</Text>
          <Text style={styles.footerArab}>
            إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَوْقُوتًا
          </Text>
          <Text style={styles.footerText}>
            Semoga hari ini penuh berkah
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WARNA.hijauTua,
  },

  /* Header */
  header: {
    backgroundColor: WARNA.hijauTua,
    paddingTop: 22,
    paddingBottom: 80,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  bismillah: {
    fontSize: 22,
    color: WARNA.emasMuda,
    textAlign: 'center',
  },
  ornamenBaris: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    width: '60%',
  },
  garisEmas: {
    flex: 1,
    height: 1,
    backgroundColor: WARNA.emas,
    opacity: 0.6,
  },
  ornamen: {
    color: WARNA.emas,
    marginHorizontal: 10,
    fontSize: 14,
  },
  logo: {
    fontSize: 30,
    fontWeight: '800',
    color: WARNA.putih,
    letterSpacing: 3,
    marginTop: 14,
  },
  sapaan: {
    fontSize: 16,
    color: WARNA.emasMuda,
    marginTop: 14,
    fontWeight: '600',
  },
  subsapaan: {
    color: '#BFD6CB',
    marginTop: 4,
    fontSize: 14,
  },
  tanggal: {
    color: '#9DBBAD',
    marginTop: 10,
    fontSize: 12,
    letterSpacing: 0.5,
  },

  /* Kartu utama */
  kartuUtamaLuar: {
    marginHorizontal: 20,
    marginTop: -56,
    padding: 3,
    borderRadius: 30,
    backgroundColor: WARNA.emas,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  kartuUtama: {
    backgroundColor: WARNA.hijau,
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: 27,
    alignItems: 'center',
  },
  ornamenKecil: {
    fontSize: 26,
    color: WARNA.emas,
  },
  label: {
    fontSize: 11,
    color: WARNA.emasMuda,
    fontWeight: '700',
    letterSpacing: 2.5,
    marginTop: 6,
  },
  namaSholat: {
    fontSize: 26,
    color: WARNA.putih,
    fontWeight: '700',
    marginTop: 12,
  },
  namaArab: {
    fontSize: 20,
    color: WARNA.emasMuda,
    marginTop: 2,
  },
  waktuBesar: {
    fontSize: 54,
    fontWeight: '800',
    color: WARNA.putih,
    marginTop: 6,
    letterSpacing: 2,
  },
  pil: {
    backgroundColor: 'rgba(201,162,75,0.2)',
    borderColor: WARNA.emas,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 10,
  },
  pilTeks: {
    color: WARNA.emasMuda,
    fontSize: 13,
    fontWeight: '600',
  },
  kotaKartu: {
    color: '#BFD6CB',
    marginTop: 14,
    fontSize: 20,
  },

  /* Lokasi */
  kartuLokasi: {
    backgroundColor: WARNA.putih,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 18,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: WARNA.emasMuda,
    elevation: 2,
  },
  judulLokasi: {
    fontSize: 17,
    fontWeight: '700',
    color: WARNA.teks,
  },
  lokasiAktif: {
    fontSize: 13,
    color: WARNA.teksLembut,
    marginTop: 4,
    marginBottom: 12,
  },
  input: {
    backgroundColor: WARNA.krem,
    borderWidth: 1,
    borderColor: WARNA.emasMuda,
    borderRadius: 14,
    padding: 13,
    color: WARNA.teks,
    fontSize: 15,
  },
  tombolCari: {
    backgroundColor: WARNA.hijau,
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  teksTombol: {
    color: WARNA.putih,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  tombolGPS: {
    backgroundColor: WARNA.hijauMuda,
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#CFE2D8',
  },
  teksTombolGPS: {
    color: WARNA.hijau,
    fontWeight: '700',
  },
  error: {
    color: WARNA.error,
    marginTop: 12,
    fontSize: 13,
  },

  /* Daftar */
  judulBaris: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 28,
    marginBottom: 16,
  },
  garisJudul: {
    flex: 1,
    height: 1,
    backgroundColor: WARNA.emas,
    opacity: 0.5,
  },
  judul: {
    fontSize: 16,
    fontWeight: '700',
    color: WARNA.teks,
    marginHorizontal: 12,
  },
  kartuSholat: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WARNA.putih,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EFE7D2',
    elevation: 1,
  },
  kartuSholatAktif: {
    backgroundColor: WARNA.hijau,
    borderColor: WARNA.emas,
    borderWidth: 1.5,
    elevation: 4,
  },
  lingkaran: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: WARNA.hijauMuda,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  lingkaranAktif: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  emojiKecil: {
    fontSize: 22,
  },
  namaKecil: {
    fontSize: 16,
    color: WARNA.teks,
    fontWeight: '700',
  },
  arabKecil: {
    fontSize: 14,
    color: WARNA.teksLembut,
    marginTop: 1,
  },
  teksAktif: {
    color: WARNA.putih,
  },
  arabAktif: {
    color: WARNA.emasMuda,
  },
  jam: {
    fontSize: 20,
    color: WARNA.hijau,
    fontWeight: '800',
    letterSpacing: 1,
  },
  jamAktif: {
    color: WARNA.emasMuda,
  },

  /* Footer */
  footer: {
    paddingVertical: 30,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  footerArab: {
    fontSize: 17,
    color: WARNA.hijau,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 28,
  },
  footerText: {
    color: WARNA.teksLembut,
    marginTop: 8,
    fontSize: 13,
  },
});