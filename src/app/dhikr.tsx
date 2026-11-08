import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { C, MAX_WIDTH } from '@/constants/palette';
import { pushFavorite } from '@/services/sync';

type Dua = {
  id: number;
  title: string;
  arabic: string | null;
  latin: string | null;
  translation: string | null;
  category: string | null;
  fav: number;
};

const FILTER = ['Semua', 'Dzikir', 'Sholat', 'Harian', 'Favorit'] as const;
type Filter = (typeof FILTER)[number];

const IKON: Record<string, string> = { Dzikir: '📿', Sholat: '🕌', Harian: '🌿' };

export default function DhikrScreen() {
  const db = useSQLiteContext();

  const [duas, setDuas] = useState<Dua[]>([]);
  const [filter, setFilter] = useState<Filter>('Semua');
  const [cari, setCari] = useState('');
  const [terbuka, setTerbuka] = useState<number | null>(null);

  const load = useCallback(async () => {
    const rows = await db.getAllAsync<Dua>(
      `SELECT d.id, d.title, d.arabic, d.latin, d.translation, d.category,
              CASE WHEN f.dua_id IS NULL THEN 0 ELSE 1 END AS fav
       FROM daily_duas d
       LEFT JOIN favorites f ON f.dua_id = d.id
       ORDER BY d.id`,
    );
    setDuas(rows);
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  // Simpan ke SQLite dulu, lalu kirim ke Supabase (jika gagal, data HP tetap aman)
  async function toggleFav(d: Dua) {
    const on = d.fav === 0;
    setDuas((prev) => prev.map((x) => (x.id === d.id ? { ...x, fav: on ? 1 : 0 } : x)));

    if (on) {
      await db.runAsync('INSERT OR IGNORE INTO favorites (dua_id) VALUES (?)', [d.id]);
    } else {
      await db.runAsync('DELETE FROM favorites WHERE dua_id = ?', [d.id]);
    }
    pushFavorite(d.id, on);
  }

  const daftar = useMemo(() => {
    const q = cari.trim().toLowerCase();
    return duas.filter((d) => {
      const cocokFilter =
        filter === 'Semua' ? true : filter === 'Favorit' ? d.fav === 1 : d.category === filter;
      const cocokCari = q === '' || d.title.toLowerCase().includes(q);
      return cocokFilter && cocokCari;
    });
  }, [duas, filter, cari]);

  const jumlahFav = duas.filter((d) => d.fav === 1).length;

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {/* HEADER */}
        <View style={s.header}>
          <Text style={s.arab}>الأذكار والأدعية</Text>
          <View style={s.ornamen}>
            <View style={s.garis} />
            <Text style={s.bintang}>✦</Text>
            <View style={s.garis} />
          </View>
          <Text style={s.title}>Doa & Dzikir</Text>
          <Text style={s.sub}>Bacaan harian, bisa dibuka tanpa internet</Text>
        </View>

        <View style={s.body}>
          {/* PENCARIAN */}
          <View style={s.kartuCari}>
            <TextInput
              style={s.input}
              placeholder="Cari doa atau dzikir..."
              placeholderTextColor="#8AA398"
              value={cari}
              onChangeText={setCari}
              returnKeyType="search"
            />
          </View>

          {/* FILTER */}
          <View style={s.chips}>
            {FILTER.map((f) => {
              const aktif = filter === f;
              return (
                <Pressable
                  key={f}
                  onPress={() => setFilter(f)}
                  style={[s.chip, aktif && s.chipAktif]}>
                  <Text style={[s.chipTeks, aktif && { color: '#FFFFFF' }]}>
                    {f === 'Favorit' ? `★ Favorit (${jumlahFav})` : f}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* DAFTAR */}
          {duas.length === 0 && (
            <View style={s.kosong}>
              <Text style={s.kosongTeks}>
                Data doa belum ada. Pastikan database/initDatabase.ts sudah diganti, lalu tutup dan
                buka ulang aplikasi.
              </Text>
            </View>
          )}

          {duas.length > 0 && daftar.length === 0 && (
            <View style={s.kosong}>
              <Text style={s.kosongTeks}>
                {filter === 'Favorit'
                  ? 'Belum ada favorit. Ketuk ☆ pada doa untuk menyimpannya.'
                  : 'Tidak ada doa yang cocok.'}
              </Text>
            </View>
          )}

          {daftar.map((d) => {
            const buka = terbuka === d.id;
            return (
              <View key={d.id} style={s.kartu}>
                <Pressable
                  style={s.kepala}
                  onPress={() => setTerbuka(buka ? null : d.id)}>
                  <View style={s.lingkaran}>
                    <Text style={{ fontSize: 20 }}>{IKON[d.category ?? ''] ?? '📖'}</Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={s.judul}>{d.title}</Text>
                    <Text style={s.kategori}>{d.category ?? 'Umum'}</Text>
                  </View>

                  <Pressable onPress={() => toggleFav(d)} hitSlop={12} style={s.bintangTombol}>
                    <Text style={[s.bintangTeks, d.fav === 1 && { color: C.gold }]}>
                      {d.fav === 1 ? '★' : '☆'}
                    </Text>
                  </Pressable>
                </Pressable>

                {buka && (
                  <View style={s.isi}>
                    {!!d.arabic && <Text style={s.arabBesar}>{d.arabic}</Text>}
                    {!!d.latin && <Text style={s.latin}>{d.latin}</Text>}
                    {!!d.translation && (
                      <>
                        <View style={s.pemisah} />
                        <Text style={s.arti}>{d.translation}</Text>
                      </>
                    )}
                  </View>
                )}
              </View>
            );
          })}

          <Text style={s.catatan}>
            Periksa kembali bacaan dengan sumber atau ustadz terpercaya.
          </Text>
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

  kartuCari: {
    marginHorizontal: 20,
    marginTop: -34,
    backgroundColor: C.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    padding: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  input: {
    backgroundColor: C.cream,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: C.text,
    fontSize: 15,
  },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginHorizontal: 20, marginVertical: 18 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
  },
  chipAktif: { backgroundColor: C.green, borderColor: C.green },
  chipTeks: { fontWeight: '700', color: C.green, fontSize: 13 },

  kartu: {
    backgroundColor: C.card,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
  },
  kepala: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  lingkaran: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.greenSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  judul: { fontSize: 15, fontWeight: '700', color: C.text },
  kategori: { fontSize: 12, color: C.muted, marginTop: 2, fontWeight: '600' },
  bintangTombol: { paddingHorizontal: 6 },
  bintangTeks: { fontSize: 26, color: C.border },

  isi: { paddingHorizontal: 18, paddingBottom: 20 },
  arabBesar: {
    fontSize: 28,
    lineHeight: 52,
    color: C.text,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  latin: { fontSize: 14, fontStyle: 'italic', color: C.green, lineHeight: 22, marginTop: 10 },
  pemisah: { height: 1, backgroundColor: C.border, marginVertical: 12 },
  arti: { fontSize: 14, color: C.text, lineHeight: 22 },

  kosong: {
    marginHorizontal: 20,
    padding: 24,
    borderRadius: 20,
    backgroundColor: C.creamDeep,
    alignItems: 'center',
  },
  kosongTeks: { color: C.muted, textAlign: 'center', lineHeight: 20, fontSize: 13 },

  catatan: { textAlign: 'center', color: C.muted, fontSize: 12, marginTop: 8, paddingHorizontal: 30 },
  footer: { textAlign: 'center', color: C.gold, marginTop: 16, fontSize: 16 },
});