import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    Vibration,
    View,
    useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import QiblaMap from '../components/QiblaMap';
import { useHeading } from '../hooks/use-heading';
import { searchCity as cariKota, getUserLocation } from '../services/locationService';
import { arahMataAngin, hitungKiblat, jarakKeKabah } from '../services/qiblaService';

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
  // warna status kompas
  lurus: '#1FA85A', // hijau = sudah menghadap kiblat
  belum: '#D64545', // merah = belum lurus
  diam: '#9DB5A9', // abu = kompas belum aktif
};

type Lokasi = { latitude: number; longitude: number; nama: string };

/* ---------------- KOMPAS ---------------- */
function Kompas({
  size,
  heading,
  bearing,
  warna,
  latar,
}: {
  size: number;
  heading: number | null;
  bearing: number | null;
  warna: string;
  latar: string;
}) {
  const r = size / 2;
  const rot = heading ?? 0;

  const huruf = [
    { l: 'U', a: 0, c: WARNA.error },
    { l: 'T', a: 90, c: WARNA.teks },
    { l: 'S', a: 180, c: WARNA.teks },
    { l: 'B', a: 270, c: WARNA.teks },
  ];

  return (
    <View style={{ width: size, height: size }}>
      {/* cincin luar — berubah warna sesuai status */}
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: r,
          borderWidth: 10,
          borderColor: warna,
          backgroundColor: latar,
        }}
      />

      {/* piringan yang berputar mengikuti arah HP */}
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          transform: [{ rotate: `${-rot}deg` }],
        }}
      >
        {Array.from({ length: 36 }).map((_, i) => (
          <View
            key={i}
            style={{
              position: 'absolute',
              width: size,
              height: size,
              alignItems: 'center',
              transform: [{ rotate: `${i * 10}deg` }],
            }}
          >
            <View
              style={{
                width: i % 9 === 0 ? 3 : 2,
                height: i % 3 === 0 ? 14 : 7,
                marginTop: 16,
                borderRadius: 1,
                backgroundColor: i % 9 === 0 ? WARNA.emas : '#C9D8CF',
              }}
            />
          </View>
        ))}

        {huruf.map((h) => {
          const a = (h.a * Math.PI) / 180;
          const rad = r - 52;
          return (
            <Text
              key={h.l}
              style={{
                position: 'absolute',
                width: 28,
                height: 28,
                textAlign: 'center',
                fontSize: 18,
                fontWeight: '800',
                color: h.c,
                left: r + rad * Math.sin(a) - 14,
                top: r - rad * Math.cos(a) - 14,
              }}
            >
              {h.l}
            </Text>
          );
        })}

        {/* jarum + ikon Ka'bah (hanya muncul setelah lokasi ditemukan) */}
        {bearing !== null && (
          <View
            style={{
              position: 'absolute',
              width: size,
              height: size,
              transform: [{ rotate: `${bearing}deg` }],
            }}
          >
            <View
              style={{
                position: 'absolute',
                left: r - 2.5,
                top: 78,
                width: 5,
                height: r - 78,
                borderRadius: 3,
                backgroundColor: warna,
              }}
            />
            <View
              style={{
                position: 'absolute',
                left: r - 26,
                top: 22,
                width: 52,
                height: 52,
                borderRadius: 26,
                backgroundColor: WARNA.putih,
                borderWidth: 3,
                borderColor: warna,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 26 }}>🕋</Text>
            </View>
          </View>
        )}
      </View>

      {/* penunjuk tetap di atas = arah hadap HP */}
      <View
        style={{
          position: 'absolute',
          top: -4,
          left: r - 12,
          width: 0,
          height: 0,
          borderLeftWidth: 12,
          borderRightWidth: 12,
          borderTopWidth: 20,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderTopColor: WARNA.hijauTua,
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: r - 8,
          top: r - 8,
          width: 16,
          height: 16,
          borderRadius: 8,
          backgroundColor: WARNA.hijauTua,
          borderWidth: 3,
          borderColor: WARNA.putih,
        }}
      />
    </View>
  );
}

/* ---------------- HALAMAN ---------------- */
export default function QiblaScreen() {
  const { width } = useWindowDimensions();
  const size = Math.min(width - 90, 300);

  const [lokasi, setLokasi] = useState<Lokasi | null>(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Kompas baru aktif SETELAH lokasi ditemukan
  const { heading, accuracy, error: sensorError } = useHeading(lokasi !== null);

  const bearing = lokasi ? hitungKiblat(lokasi.latitude, lokasi.longitude) : null;
  const jarak = lokasi ? jarakKeKabah(lokasi.latitude, lokasi.longitude) : null;

  // selisih terpendek: positif = putar ke kanan, negatif = putar ke kiri
  const delta =
    bearing !== null && heading !== null ? ((bearing - heading + 540) % 360) - 180 : null;
  const lurus = delta !== null && Math.abs(delta) <= 5;

  const warna = delta === null ? WARNA.diam : lurus ? WARNA.lurus : WARNA.belum;
  const latar = delta === null ? WARNA.putih : lurus ? '#EAFBF1' : '#FFF1F0';

  let status = 'Tekan "Lokasi Saya" untuk mengaktifkan kompas';
  if (lokasi && heading === null) status = sensorError || 'Menunggu sensor kompas… gerakkan HP perlahan';
  if (delta !== null) {
    status = lurus
      ? 'Sudah menghadap kiblat ✓'
      : `Putar ke ${delta > 0 ? 'kanan' : 'kiri'} ${Math.abs(Math.round(delta))}°`;
  }

  // getar sekali saat baru saja lurus
  const sebelumnya = useRef(false);
  useEffect(() => {
    if (lurus && !sebelumnya.current && Platform.OS !== 'web') Vibration.vibrate(80);
    sebelumnya.current = lurus;
  }, [lurus]);

  async function handleLokasi() {
    try {
      setLoading(true);
      setError('');
      const loc = await getUserLocation();
      setLokasi({
        latitude: loc.latitude,
        longitude: loc.longitude,
        nama: loc.city || 'Lokasi saya',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mendeteksi lokasi');
    } finally {
      setLoading(false);
    }
  }

  async function handleCari() {
    const kata = query.trim();
    if (!kata) {
      setError('Masukkan nama kota atau kabupaten terlebih dahulu');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const kota = await cariKota(kata);
      setLokasi({
        latitude: kota.latitude,
        longitude: kota.longitude,
        nama: kota.region ? `${kota.name}, ${kota.region}` : kota.name,
      });
      setQuery('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mencari lokasi');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <ScrollView style={{ backgroundColor: WARNA.krem }} showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.arab}>اتجاه القبلة</Text>
          <View style={styles.ornamenBaris}>
            <View style={styles.garisEmas} />
            <Text style={styles.ornamen}>✦</Text>
            <View style={styles.garisEmas} />
          </View>
          <Text style={styles.logo}>Arah Kiblat</Text>
          <Text style={styles.sub}>
            {lokasi ? `Dari ${lokasi.nama}` : 'Aktifkan lokasi untuk mencari arah kiblat'}
          </Text>
        </View>

        {/* KARTU KOMPAS */}
        <View style={styles.kartuLuar}>
          <View style={styles.kartuKompas}>
            <Kompas size={size} heading={heading} bearing={bearing} warna={warna} latar={latar} />

            <View style={[styles.statusPil, { backgroundColor: warna }]}>
              <Text style={styles.statusTeks}>{status}</Text>
            </View>

            {heading !== null && accuracy <= 1 && (
              <Text style={styles.kalibrasi}>
                Kompas kurang akurat. Gerakkan HP membentuk angka 8 untuk kalibrasi.
              </Text>
            )}

            <TouchableOpacity
              style={styles.tombolLokasi}
              onPress={handleLokasi}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={WARNA.putih} />
              ) : (
                <Text style={styles.teksTombol}>📍 Lokasi Saya</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {!!error && <Text style={styles.error}>{error}</Text>}

        {/* INFO */}
        <View style={styles.infoBaris}>
          <View style={styles.info}>
            <Text style={styles.infoLabel}>Arah Kiblat</Text>
            <Text style={styles.infoNilai}>{bearing !== null ? `${bearing.toFixed(1)}°` : '--'}</Text>
            <Text style={styles.infoKet}>{bearing !== null ? arahMataAngin(bearing) : ' '}</Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.infoLabel}>Jarak ke Ka'bah</Text>
            <Text style={styles.infoNilai}>
              {jarak !== null ? Math.round(jarak).toLocaleString('id-ID') : '--'}
            </Text>
            <Text style={styles.infoKet}>kilometer</Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.infoLabel}>Arah HP</Text>
            <Text style={styles.infoNilai}>{heading !== null ? `${Math.round(heading)}°` : '--'}</Text>
            <Text style={styles.infoKet}>{heading !== null ? arahMataAngin(heading) : ' '}</Text>
          </View>
        </View>

        {/* CARI KOTA MANUAL */}
        <View style={styles.kartu}>
          <Text style={styles.judulKartu}>Atau pilih kota manual</Text>
          <TextInput
            style={styles.input}
            placeholder="Cari kota atau kabupaten..."
            placeholderTextColor="#8AA398"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleCari}
            returnKeyType="search"
          />
          <TouchableOpacity
            style={styles.tombolCari}
            onPress={handleCari}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.teksTombol}>Cari Lokasi</Text>
          </TouchableOpacity>
          {lokasi && (
            <Text style={styles.koordinat}>
              {lokasi.nama} • {lokasi.latitude.toFixed(4)}, {lokasi.longitude.toFixed(4)}
            </Text>
          )}
        </View>

        {/* PETA */}
        <View style={styles.kartu}>
          <Text style={styles.judulKartu}>Peta Arah Kiblat</Text>
          {lokasi ? (
            <>
              <QiblaMap latitude={lokasi.latitude} longitude={lokasi.longitude} />
              <Text style={styles.catatan}>
                Garis emas putus-putus adalah jalur terpendek menuju Ka'bah. Peta membutuhkan internet.
              </Text>
            </>
          ) : (
            <View style={styles.petaKosong}>
              <Text style={{ fontSize: 34 }}>🗺️</Text>
              <Text style={styles.petaKosongTeks}>Peta tampil setelah lokasi ditemukan</Text>
            </View>
          )}
        </View>

        {/* TIPS */}
        <View style={styles.kartu}>
          <Text style={styles.judulKartu}>Tips akurasi</Text>
          <Text style={styles.tips}>• Letakkan HP mendatar, jauhkan dari magnet dan benda logam.</Text>
          <Text style={styles.tips}>• Merah = belum lurus, hijau = sudah menghadap kiblat (toleransi ±5°).</Text>
          <Text style={styles.tips}>• Arah dihitung dari koordinat, bukan dari peta, jadi tetap bisa tanpa internet.</Text>
          <Text style={styles.tips}>• Pastikan juga dengan arah kiblat masjid setempat.</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.ornamen}>✦ ۞ ✦</Text>
          <Text style={styles.footerText}>Semoga ibadah kita diterima</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: WARNA.hijauTua },

  header: {
    backgroundColor: WARNA.hijauTua,
    paddingTop: 22,
    paddingBottom: 70,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  arab: { fontSize: 24, color: WARNA.emasMuda, textAlign: 'center' },
  ornamenBaris: { flexDirection: 'row', alignItems: 'center', marginTop: 12, width: '60%' },
  garisEmas: { flex: 1, height: 1, backgroundColor: WARNA.emas, opacity: 0.6 },
  ornamen: { color: WARNA.emas, marginHorizontal: 10, fontSize: 14 },
  logo: { fontSize: 28, fontWeight: '800', color: WARNA.putih, letterSpacing: 2, marginTop: 14 },
  sub: { color: '#BFD6CB', marginTop: 8, fontSize: 14, textAlign: 'center' },

  kartuLuar: {
    marginHorizontal: 20,
    marginTop: -46,
    padding: 3,
    borderRadius: 30,
    backgroundColor: WARNA.emas,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  kartuKompas: {
    backgroundColor: WARNA.putih,
    paddingVertical: 28,
    paddingHorizontal: 16,
    borderRadius: 27,
    alignItems: 'center',
  },
  statusPil: {
    marginTop: 26,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
  },
  statusTeks: { color: WARNA.putih, fontWeight: '800', fontSize: 15, textAlign: 'center' },
  kalibrasi: { color: WARNA.teksLembut, fontSize: 12, marginTop: 12, textAlign: 'center' },
  tombolLokasi: {
    backgroundColor: WARNA.hijau,
    paddingVertical: 15,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
    minWidth: 200,
  },
  teksTombol: { color: WARNA.putih, fontWeight: '700', letterSpacing: 0.5 },

  error: { color: WARNA.error, marginHorizontal: 24, marginTop: 14, fontSize: 13, textAlign: 'center' },

  infoBaris: { flexDirection: 'row', marginHorizontal: 20, marginTop: 18, gap: 10 },
  info: {
    flex: 1,
    backgroundColor: WARNA.putih,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFE7D2',
  },
  infoLabel: { fontSize: 11, color: WARNA.teksLembut, fontWeight: '600', textAlign: 'center' },
  infoNilai: { fontSize: 20, color: WARNA.hijau, fontWeight: '800', marginTop: 6 },
  infoKet: { fontSize: 11, color: WARNA.teksLembut, marginTop: 2 },

  kartu: {
    backgroundColor: WARNA.putih,
    marginHorizontal: 20,
    marginTop: 18,
    padding: 18,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: WARNA.emasMuda,
  },
  judulKartu: { fontSize: 16, fontWeight: '700', color: WARNA.teks, marginBottom: 12 },
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
  koordinat: { color: WARNA.teksLembut, fontSize: 12, marginTop: 12 },
  catatan: { color: WARNA.teksLembut, fontSize: 12, marginTop: 10, lineHeight: 18 },
  petaKosong: {
    height: 160,
    borderRadius: 18,
    backgroundColor: WARNA.hijauMuda,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  petaKosongTeks: { color: WARNA.teksLembut, fontSize: 13 },
  tips: { color: WARNA.teks, fontSize: 13, lineHeight: 20, marginTop: 4 },

  footer: { paddingVertical: 30, alignItems: 'center' },
  footerText: { color: WARNA.teksLembut, marginTop: 8, fontSize: 13 },
});