import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { C, MAX_WIDTH, PRAYERS, PrayerKey } from '@/constants/palette';
import { daysAgo, ymd } from '@/services/dates';
import { pushLog, syncLogs } from '@/services/sync';

type SyncState = 'idle' | 'syncing' | 'synced' | 'offline';

const HARI = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

const SYNC_INFO: Record<SyncState, { teks: string; warna: string }> = {
  idle: { teks: 'Siap', warna: C.muted },
  syncing: { teks: 'Menyinkron…', warna: C.gold },
  synced: { teks: 'Tersinkron ✓', warna: C.green },
  offline: { teks: 'Belum tersinkron', warna: C.danger },
};

type Hari = { key: string; label: string; n: number; hariIni: boolean };

export default function ChecklistScreen() {
  const db = useSQLiteContext();

  const [done, setDone] = useState<Record<string, boolean>>({});
  const [week, setWeek] = useState<Hari[]>([]);
  const [sync, setSync] = useState<SyncState>('idle');

  // Baca dari SQLite (selalu cepat & bisa offline)
  const load = useCallback(async () => {
    const today = ymd();

    const rows = await db.getAllAsync<{ prayer_name: string; is_completed: number }>(
      'SELECT prayer_name, is_completed FROM prayer_logs WHERE prayer_date = ?',
      [today],
    );
    const map: Record<string, boolean> = {};
    rows.forEach((r) => {
      map[r.prayer_name] = r.is_completed === 1;
    });
    setDone(map);

    const counts = await db.getAllAsync<{ prayer_date: string; n: number }>(
      `SELECT prayer_date, COUNT(*) AS n FROM prayer_logs
       WHERE is_completed = 1 AND prayer_date >= ?
       GROUP BY prayer_date`,
      [ymd(daysAgo(6))],
    );
    const byDate = new Map(counts.map((c) => [c.prayer_date, c.n]));

    setWeek(
      Array.from({ length: 7 }, (_, i) => {
        const d = daysAgo(6 - i);
        const key = ymd(d);
        return { key, label: HARI[d.getDay()], n: byDate.get(key) ?? 0, hariIni: key === today };
      }),
    );
  }, [db]);

  // Kirim data HP ke Supabase, lalu ambil data cloud yang belum ada di HP
  const runSync = useCallback(async () => {
    setSync('syncing');
    const ok = await syncLogs(db);
    setSync(ok ? 'synced' : 'offline');
    if (ok) await load();
  }, [db, load]);

  useFocusEffect(
    useCallback(() => {
      load();
      runSync();
    }, [load, runSync]),
  );

  // Simpan ke SQLite dulu (offline-first), baru kirim ke Supabase
  async function toggle(key: PrayerKey) {
    const today = ymd();
    const next = !done[key];
    const at = next ? new Date().toISOString() : null;

    setDone((prev) => ({ ...prev, [key]: next }));

    await db.runAsync(
      `INSERT INTO prayer_logs (prayer_name, prayer_date, is_completed, completed_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(prayer_name, prayer_date) DO UPDATE SET
         is_completed = excluded.is_completed,
         completed_at = excluded.completed_at`,
      [key, today, next ? 1 : 0, at],
    );
    load();

    setSync('syncing');
    const ok = await pushLog(key, today, next, at);
    setSync(ok ? 'synced' : 'offline');
  }

  const jumlah = PRAYERS.filter((p) => done[p.key]).length;
  const persen = (jumlah / PRAYERS.length) * 100;
  const totalMinggu = week.reduce((a, b) => a + b.n, 0);
  const info = SYNC_INFO[sync];

  const pesan =
    jumlah === 5
      ? 'Alhamdulillah, lengkap hari ini 🎉'
      : jumlah === 0
        ? 'Yuk mulai dari sholat pertama hari ini'
        : `Tinggal ${5 - jumlah} lagi, semangat!`;

  const tanggal = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={s.header}>
          <Text style={s.arab}>قائمة الصلاة</Text>
          <View style={s.ornamen}>
            <View style={s.garis} />
            <Text style={s.bintang}>✦</Text>
            <View style={s.garis} />
          </View>
          <Text style={s.title}>Checklist Sholat</Text>
          <Text style={s.sub}>{tanggal}</Text>
        </View>

        <View style={s.body}>
          {/* RINGKASAN */}
          <View style={s.kartuLuar}>
            <View style={s.kartuRingkas}>
              <Text style={s.angka}>
                {jumlah}
                <Text style={s.angkaKecil}> / 5</Text>
              </Text>
              <Text style={s.pesan}>{pesan}</Text>
              <View style={s.track}>
                <View style={[s.fill, { width: `${persen}%` }]} />
              </View>
            </View>
          </View>

          {/* DAFTAR SHOLAT */}
          <Text style={s.judulBagian}>Sholat hari ini</Text>

          {PRAYERS.map((p) => {
            const selesai = !!done[p.key];
            return (
              <Pressable
                key={p.key}
                onPress={() => toggle(p.key)}
                style={({ pressed }) => [
                  s.baris,
                  selesai && s.barisSelesai,
                  pressed && { opacity: 0.85 },
                ]}>
                <View style={[s.lingkaran, selesai && { backgroundColor: C.green }]}>
                  <Text style={{ fontSize: 22 }}>{p.icon}</Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={s.nama}>{p.nama}</Text>
                  <Text style={s.arabKecil}>{p.arab}</Text>
                </View>

                <View style={[s.centang, selesai && s.centangAktif]}>
                  {selesai && <Text style={s.centangTeks}>✓</Text>}
                </View>
              </Pressable>
            );
          })}

          {/* 7 HARI TERAKHIR */}
          <View style={s.kartu}>
            <View style={s.barisJudul}>
              <Text style={s.judulKartu}>7 hari terakhir</Text>
              <Text style={s.totalMinggu}>{totalMinggu} / 35</Text>
            </View>

            <View style={s.grafik}>
              {week.map((d) => (
                <View key={d.key} style={s.kolom}>
                  <Text style={s.kolomAngka}>{d.n}</Text>
                  <View style={s.batang}>
                    <View
                      style={{
                        width: '100%',
                        height: `${(d.n / 5) * 100}%`,
                        borderRadius: 12,
                        backgroundColor: d.n === 5 ? C.green : C.gold,
                      }}
                    />
                  </View>
                  <Text style={[s.kolomLabel, d.hariIni && s.kolomLabelAktif]}>{d.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* SINKRONISASI */}
          <View style={s.kartu}>
            <View style={s.barisJudul}>
              <Text style={s.judulKartu}>Database Supabase</Text>
              <View
                style={[s.badge, { borderColor: info.warna, backgroundColor: info.warna + '1A' }]}>
                <Text style={[s.badgeTeks, { color: info.warna }]}>{info.teks}</Text>
              </View>
            </View>
            <Text style={s.catatan}>
              Catatan disimpan di HP lebih dulu, lalu dikirim ke Supabase saat ada internet.
              {sync === 'offline' ? ' Jika terus gagal, periksa internet atau pengaturan Supabase.' : ''}
            </Text>
            <Pressable
              onPress={runSync}
              disabled={sync === 'syncing'}
              style={({ pressed }) => [s.tombol, pressed && { opacity: 0.85 }]}>
              <Text style={s.tombolTeks}>Sinkronkan sekarang</Text>
            </Pressable>
          </View>

          <Text style={s.footer}>✦ Semoga istiqomah ✦</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.deep },
  scroll: { backgroundColor: C.cream },

  header: {
    backgroundColor: C.deep,
    paddingTop: 22,
    paddingBottom: 76,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  arab: { fontSize: 24, color: C.goldSoft, textAlign: 'center' },
  ornamen: { flexDirection: 'row', alignItems: 'center', marginTop: 12, width: '60%' },
  garis: { flex: 1, height: 1, backgroundColor: C.gold, opacity: 0.6 },
  bintang: { color: C.gold, marginHorizontal: 10, fontSize: 14 },
  title: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', letterSpacing: 2, marginTop: 14 },
  sub: { color: '#BFD6CB', marginTop: 8, fontSize: 13 },

  body: { width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center', paddingBottom: 32 },

  kartuLuar: {
    marginHorizontal: 20,
    marginTop: -50,
    padding: 3,
    borderRadius: 30,
    backgroundColor: C.gold,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  kartuRingkas: {
    backgroundColor: C.green,
    paddingVertical: 26,
    paddingHorizontal: 22,
    borderRadius: 27,
    alignItems: 'center',
  },
  angka: { fontSize: 56, fontWeight: '800', color: '#FFFFFF' },
  angkaKecil: { fontSize: 24, fontWeight: '700', color: C.goldSoft },
  pesan: { color: C.goldSoft, fontWeight: '700', marginTop: 4, fontSize: 14, textAlign: 'center' },
  track: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginTop: 18,
    overflow: 'hidden',
  },
  fill: { height: 8, borderRadius: 4, backgroundColor: C.gold },

  judulBagian: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
    marginHorizontal: 24,
    marginTop: 26,
    marginBottom: 14,
  },

  baris: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
  },
  barisSelesai: { backgroundColor: C.greenSoft, borderColor: C.gold, borderWidth: 1.5 },
  lingkaran: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: C.greenSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  nama: { fontSize: 16, fontWeight: '700', color: C.text },
  arabKecil: { fontSize: 14, color: C.muted, marginTop: 1 },
  centang: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centangAktif: { backgroundColor: C.green, borderColor: C.green },
  centangTeks: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },

  kartu: {
    backgroundColor: C.card,
    marginHorizontal: 20,
    marginTop: 14,
    padding: 18,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: C.border,
  },
  barisJudul: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  judulKartu: { fontSize: 16, fontWeight: '700', color: C.text },
  totalMinggu: { fontSize: 14, fontWeight: '800', color: C.green },

  grafik: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, height: 140 },
  kolom: { flex: 1, alignItems: 'center' },
  kolomAngka: { fontSize: 11, color: C.muted, fontWeight: '700', marginBottom: 4 },
  batang: {
    flex: 1,
    width: 22,
    borderRadius: 12,
    backgroundColor: C.creamDeep,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  kolomLabel: { fontSize: 11, color: C.muted, marginTop: 6, fontWeight: '600' },
  kolomLabelAktif: { color: C.green, fontWeight: '800' },

  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
  badgeTeks: { fontSize: 12, fontWeight: '700' },
  catatan: { color: C.muted, fontSize: 12, lineHeight: 18, marginTop: 10 },
  tombol: {
    backgroundColor: C.green,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 14,
  },
  tombolTeks: { color: '#FFFFFF', fontWeight: '700', letterSpacing: 0.5 },

  footer: { textAlign: 'center', color: C.gold, marginTop: 24, fontWeight: '600' },
});