# Sholaty

**Sholaty** adalah aplikasi pendamping ibadah harian untuk umat Muslim di Indonesia, dibangun dengan React Native, Expo, dan Expo Router. Aplikasi dapat dijalankan di Android (lewat Expo Go) maupun web. Halaman Beranda menampilkan jadwal lima waktu sholat (Subuh, Dzuhur, Ashar, Maghrib, Isya) berdasarkan kota pengguna. Kota dapat dideteksi otomatis lewat GPS atau dicari manual, dengan Pekalongan sebagai lokasi bawaan. Waktu sholat dihitung memakai layanan Aladhan dengan metode Kemenag RI sebagai pilihan utama. Seluruh aplikasi memakai tema hijau-emas dan lima tab navigasi: Beranda, Kiblat, Dzikir, Checklist, dan Pengaturan.

## Fitur

- **Jadwal sholat**: lima waktu sholat sesuai kota, dengan pilihan metode perhitungan (Kemenag RI, Muslim World League, ISNA, Umm al-Qura, Egyptian General Authority, Karachi, JAKIM, MUIS).
- **Arah kiblat**: kompas yang membaca sensor arah perangkat dan menghitung arah Ka'bah dari koordinat pengguna. Cincin merah berarti belum lurus, hijau berarti sudah menghadap kiblat (toleransi ±5°), disertai petunjuk "Putar ke kanan/kiri". Di Android, HP bergetar sekali saat sudah lurus.
- **Peta kiblat**: peta interaktif (Leaflet) yang menampilkan lokasi pengguna, Ka'bah, dan jalur terpendek di antara keduanya.
- **Checklist sholat harian**: mencatat sholat yang sudah dikerjakan hari ini dan menampilkan ringkasan tujuh hari terakhir.
- **Doa dan dzikir**: teks Arab, latin, dan terjemahan, lengkap dengan fitur favorit.
- **Pengaturan**: pilihan metode perhitungan dan preferensi pengingat sholat per waktu, termasuk berapa menit sebelum adzan.
- **Cadangan cloud**: data dicadangkan ke Supabase tanpa perlu membuat akun.

## Teknologi

| Bagian | Teknologi |
| --- | --- |
| Framework | React Native, Expo, Expo Router |
| Bahasa | TypeScript |
| Database lokal | SQLite (`expo-sqlite`) |
| Cloud | Supabase (login anonim + Row Level Security) |
| Waktu sholat | API Aladhan |
| Lokasi dan sensor | `expo-location` (GPS dan arah perangkat) |
| Peta | Leaflet, lewat `react-native-webview` (Android) dan iframe (web) |

## Cara kerja data

Sholaty menerapkan pendekatan **offline-first**. SQLite di perangkat adalah sumber data utama, sehingga aplikasi tetap berfungsi tanpa internet. Saat koneksi tersedia, data sholat harian, favorit, dan pengaturan dicadangkan ke Supabase. Sinkronisasi yang gagal tidak mengganggu aplikasi. Karena memakai login anonim, data cloud terikat ke instalasi aplikasi, dan Row Level Security memastikan pengguna hanya dapat mengakses datanya sendiri.

Arah kiblat dan kompas dihitung langsung di perangkat, jadi tetap bisa dipakai tanpa internet. Hanya peta, jadwal sholat dari Aladhan, dan sinkronisasi cloud yang membutuhkan koneksi.

## Struktur proyek

```
Sholaty/
├─ database/
│  └─ initDatabase.ts        skema tabel SQLite
└─ src/
   ├─ app/                   halaman (Expo Router)
   │  ├─ _layout.tsx         tab navigasi + SQLiteProvider
   │  ├─ index.tsx           Beranda / jadwal sholat
   │  ├─ qibla.tsx           kompas dan peta kiblat
   │  ├─ dhikr.tsx           doa dan dzikir
   │  ├─ checklist.tsx       checklist sholat harian
   │  └─ settings.tsx        pengaturan
   ├─ components/            QiblaMap (Android dan web), mapHtml
   ├─ constants/palette.ts   warna tema hijau-emas
   ├─ hooks/use-heading.ts   pembaca sensor arah perangkat
   └─ services/              lokasi, jadwal sholat, kiblat, pengaturan, sinkronisasi
```

## Menjalankan proyek

1. Pasang dependensi:

   ```bash
   npm install
   ```

2. Buat file `.env` di root proyek (jangan di-commit):

   ```
   EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=isi_key_anda
   ```

   Tanpa file ini aplikasi tetap berjalan, hanya cadangan cloud yang tidak aktif.

3. Siapkan Supabase: aktifkan **Allow anonymous sign-ins** di Authentication, lalu jalankan SQL pembuatan tabel `prayer_logs`, `favorites`, dan `app_settings` dengan Row Level Security.

4. Jalankan aplikasi:

   ```bash
   npx expo start
   ```

   Tekan `w` untuk web, atau pindai kode QR dengan Expo Go di Android.

## Catatan

- Kompas pada web desktop biasanya tidak bergerak karena laptop jarang punya sensor arah. Kompas berfungsi penuh di HP.
- Pastikan arah kiblat juga dengan arah kiblat masjid setempat.
- Teks doa dan dzikir sebaiknya diperiksa kembali dengan sumber yang dipercaya sebelum dipublikasikan.

## Rencana pengembangan

- Notifikasi pengingat sholat yang benar-benar dijadwalkan di perangkat (`expo-notifications`).
- Opsi login agar data dapat dipindahkan antar perangkat.