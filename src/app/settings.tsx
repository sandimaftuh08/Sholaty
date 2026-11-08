import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { C, MAX_WIDTH } from '@/constants/palette';
import {
    CALC_METHODS,
    DEFAULT_SETTINGS,
    getSettings,
    saveSettings,
    type Settings,
} from '@/services/settingsStore';
import { loadJson, saveJson } from '@/services/storage';
import { pullSettings, pushSettings } from '@/services/sync';

type SyncState = 'idle' | 'syncing' | 'synced' | 'offline';

const KEY_SYNCED = 'sholaty:settings_synced';

const SYNC_INFO: Record<SyncState, { teks: string; warna: string }> = {
  idle: { teks: 'Siap', warna: C.muted },
  syncing: { teks: 'Menyinkron…', warna: C.gold },
  synced: { teks: 'Tersinkron ✓', warna: C.green },
  offline: { teks: 'Belum tersinkron', warna: C.danger },
};

function gabung(local: Settings, cloud: Record<string, unknown>): Settings {
  const c = cloud as Partial<Settings>;
  return { ...local, ...c, prayers: { ...local.prayers, ...(c.prayers ?? {}) } };
}

export default function SettingsScreen() {
  const db = useSQLiteContext();

  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [sync, setSync] = useState<SyncState>('idle');
  const [info, setInfo] = useState('');
  const [stat, setStat] = useState({ sholat: 0, favorit: 0 });

  const loadStat = useCallback(async () => {
    const a = await db.getFirstAsync<{ n: number }>(
      'SELECT COUNT(*) AS n FROM prayer_logs WHERE is_completed = 1',
    );
    const b = await db.getFirstAsync<{ n: number }>('SELECT COUNT(*) AS n FROM favorites');
    setStat({ sholat: a?.n ?? 0, favorit: b?.n ?? 0 });
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      let aktif = true;

      (async () => {
        const local = await getSettings();
        if (aktif) setSettings(local);
        loadStat();

        // Pertama kali: ambil dari cloud jika ada, kalau belum ada kirim milik HP
        const sudah = await loadJson<boolean>(KEY_SYNCED, false);
        if (sudah) return;

        setSync('syncing');
        const cloud = await pullSettings();
        if (cloud) {
          const merged = gabung(local, cloud);
          await saveSettings(merged);
          if (aktif) setSettings(merged);
          await saveJson(KEY_SYNCED, true);
          if (aktif) setSync('synced');
        } else {
          const ok = await pushSettings({ ...local });
          if (ok) await saveJson(KEY_SYNCED, true);
          if (aktif) setSync(ok ? 'synced' : 'offline');
        }
      })();

      return () => {
        aktif = false;
      };
    }, [loadStat]),
  );

  async function pilihMetode(id: number) {
    if (id === settings.method) return;
    const next: Settings = { ...settings, method: id };
    setSettings(next);
    await saveSettings(next); // simpan di HP dulu

    setSync('syncing');
    const ok = await pushSettings({ ...next });
    if (ok) await saveJson(KEY_SYNCED, true);
    setSync(ok ? 'synced' : 'offline');
    setInfo('');
  }

  async function kirimKeCloud() {
    setSync('syncing');
    setInfo('');
    const ok = await pushSettings({ ...settings });
    if (ok) await saveJson(KEY_SYNCED, true);
    setSync(ok ? 'synced' : 'offline');
    setInfo(ok ? 'Pengaturan HP sudah dikirim ke cloud.' : 'Gagal mengirim. Periksa internet.');
  }

  async function ambilDariCloud() {
    setSync('syncing');
    setInfo('');
    const cloud = await pullSettings();
    if (!cloud) {
      setSync('offline');
      setInfo('Belum ada pengaturan di cloud, atau tidak ada koneksi.');
      return;
    }
    const merged = gabung(settings, cloud);
    setSettings(merged);
    await saveSettings(merged);
    await saveJson(KEY_SYNCED, true);
    setSync('synced');
    setInfo('Pengaturan dari cloud sudah diterapkan.');
  }

  const status = SYNC_INFO[sync];
  const metodeAktif = CALC_METHODS.find((m) => m.id === settings.method);

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={s.header}>
          <Text style={s.arab}>الإعدادات</Text>
          <View style={s.ornamen}>
            <View style={s.garis} />
            <Text style={s.bintang}>✦</Text>
            <View style={s.garis} />
          </View>
          <Text style={s.title}>Pengaturan</Text>
          <Text style={s.sub}>Sesuaikan Sholaty dengan kebutuhanmu</Text>
        </View>

        <View style={s.body}>
          {/* RINGKASAN DATA */}
          <View style={s.kartuLuar}>
            <View style={s.ringkas}>
              <View style={s.ringkasItem}>
                <Text style={s.ringkasAngka}>{stat.sholat}</Text>
                <Text style={s.ringkasLabel}>Sholat tercatat</Text>
              </View>
              <View style={s.ringkasGaris} />
              <View style={s.ringkasItem}>
                <Text style={s.ringkasAngka}>{stat.favorit}</Text>
                <Text style={s.ringkasLabel}>Doa favorit</Text>
              </View>
            </View>
          </View>

          {/* METODE */}
          <View style={s.kartu}>
            <Text style={s.judulKartu}>Metode perhitungan</Text>
            <Text style={s.catatan}>
              Terpilih: {metodeAktif ? metodeAktif.nama : `Metode ${settings.method}`}
            </Text>

            {CALC_METHODS.map((m) => {
              const aktif = settings.method === m.id;
              return (
                <Pressable
                  key={m.id}
                  onPress={() => pilihMetode(m.id)}
                  style={({ pressed }) => [
                    s.metode,
                    aktif && s.metodeAktif,
                    pressed && { opacity: 0.85 },
                  ]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.metodeNama, aktif && { color: C.green }]}>{m.nama}</Text>
                    <Text style={s.metodeKet}>{m.ket}</Text>
                  </View>
                  <View style={[s.radio, aktif && s.radioAktif]}>
                    {aktif && <Text style={s.radioTeks}>✓</Text>}
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* CLOUD */}
          <View style={s.kartu}>
            <View style={s.barisJudul}>
              <Text style={s.judulKartu}>Database Supabase</Text>
              <View
                style={[
                  s.badge,
                  { borderColor: status.warna, backgroundColor: status.warna + '1A' },
                ]}>
                <Text style={[s.badgeTeks, { color: status.warna }]}>{status.teks}</Text>
              </View>
            </View>

            <Text style={s.catatan}>
              Pengaturan disimpan di HP dan otomatis dikirim ke cloud setiap diubah. Tanpa internet,
              aplikasi tetap jalan memakai data di HP.
            </Text>

            <View style={s.duaTombol}>
              <Pressable
                onPress={kirimKeCloud}
                disabled={sync === 'syncing'}
                style={({ pressed }) => [s.tombol, pressed && { opacity: 0.85 }]}>
                <Text style={s.tombolTeks}>Kirim ke cloud</Text>
              </Pressable>
              <Pressable
                onPress={ambilDariCloud}
                disabled={sync === 'syncing'}
                style={({ pressed }) => [s.tombolLuar, pressed && { opacity: 0.85 }]}>
                <Text style={s.tombolLuarTeks}>Ambil dari cloud</Text>
              </Pressable>
            </View>

            {!!info && <Text style={s.info}>{info}</Text>}
          </View>

          {/* TENTANG */}
          <View style={s.kartu}>
            <Text style={s.judulKartu}>Tentang Sholaty</Text>
            <Text style={s.catatan}>
              Jadwal sholat dihitung berdasarkan koordinat lokasi dan metode yang dipilih. Aplikasi ini
              tidak menggantikan jadwal resmi otoritas keagamaan setempat, jadi bandingkan dengan jadwal
              masjid terdekat.
            </Text>
          </View>

          <Text style={s.footer}>✦ ۞ ✦</Text>
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
  sub: { color: '#BFD6CB', marginTop: 8, fontSize: 13, textAlign: 'center' },

  body: { width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center', paddingBottom: 32 },

  kartuLuar: {
    marginHorizontal: 20,
    marginTop: -46,
    padding: 3,
    borderRadius: 26,
    backgroundColor: C.gold,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  ringkas: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.green,
    borderRadius: 23,
    paddingVertical: 22,
  },
  ringkasItem: { flex: 1, alignItems: 'center' },
  ringkasGaris: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.25)' },
  ringkasAngka: { fontSize: 32, fontWeight: '800', color: '#FFFFFF' },
  ringkasLabel: { fontSize: 12, color: C.goldSoft, fontWeight: '600', marginTop: 2 },

  kartu: {
    backgroundColor: C.card,
    marginHorizontal: 20,
    marginTop: 16,
    padding: 18,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: C.border,
  },
  barisJudul: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  judulKartu: { fontSize: 16, fontWeight: '700', color: C.text },
  catatan: { color: C.muted, fontSize: 12, lineHeight: 18, marginTop: 8 },

  metode: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginTop: 10,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  metodeAktif: { borderColor: C.green, backgroundColor: C.greenSoft },
  metodeNama: { fontSize: 15, fontWeight: '700', color: C.text },
  metodeKet: { fontSize: 12, color: C.muted, marginTop: 2 },
  radio: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioAktif: { backgroundColor: C.green, borderColor: C.green },
  radioTeks: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },

  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
  badgeTeks: { fontSize: 12, fontWeight: '700' },

  duaTombol: { flexDirection: 'row', gap: 10, marginTop: 14 },
  tombol: {
    flex: 1,
    backgroundColor: C.green,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
  },
  tombolTeks: { color: '#FFFFFF', fontWeight: '700' },
  tombolLuar: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: C.green,
  },
  tombolLuarTeks: { color: C.green, fontWeight: '700' },
  info: { color: C.green, fontSize: 12, marginTop: 12, fontWeight: '600' },

  footer: { textAlign: 'center', color: C.gold, marginTop: 24, fontSize: 16 },
});