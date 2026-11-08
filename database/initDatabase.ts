import type { SQLiteDatabase } from 'expo-sqlite';

import { DUAS } from '../src/data/duas';

export async function initDatabase(db: SQLiteDatabase) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS prayer_times (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      prayer_date TEXT NOT NULL,
      city TEXT NOT NULL,
      subuh TEXT NOT NULL,
      dzuhur TEXT NOT NULL,
      ashar TEXT NOT NULL,
      maghrib TEXT NOT NULL,
      isya TEXT NOT NULL,
      UNIQUE(prayer_date, city)
    );

    CREATE TABLE IF NOT EXISTS prayer_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      prayer_name TEXT NOT NULL,
      prayer_date TEXT NOT NULL,
      is_completed INTEGER DEFAULT 0,
      completed_at TEXT,
      UNIQUE(prayer_name, prayer_date)
    );

    CREATE TABLE IF NOT EXISTS daily_duas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      arabic TEXT,
      latin TEXT,
      translation TEXT
    );

    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      dua_id INTEGER NOT NULL,
      UNIQUE(dua_id)
    );

    CREATE TABLE IF NOT EXISTS user_settings (
      id INTEGER PRIMARY KEY,
      city TEXT DEFAULT 'Pekalongan',
      country TEXT DEFAULT 'Indonesia',
      latitude REAL,
      longitude REAL,
      theme TEXT DEFAULT 'blue'
    );
  `);

  const columns = await db.getAllAsync<{ name: string }>(
    'PRAGMA table_info(user_settings)'
  );

  const columnNames = columns.map((column) => column.name);

  if (!columnNames.includes('country')) {
    await db.execAsync(
      "ALTER TABLE user_settings ADD COLUMN country TEXT DEFAULT 'Indonesia'"
    );
  }

  if (!columnNames.includes('latitude')) {
    await db.execAsync(
      'ALTER TABLE user_settings ADD COLUMN latitude REAL'
    );
  }

  if (!columnNames.includes('longitude')) {
    await db.execAsync(
      'ALTER TABLE user_settings ADD COLUMN longitude REAL'
    );
  }

  await db.runAsync(`
    INSERT OR IGNORE INTO user_settings (id, city, country, theme)
    VALUES (1, 'Pekalongan', 'Indonesia', 'blue')
  `);

  // ---- TAMBAHAN: kolom kategori untuk filter di halaman Dzikir ----
  const duaColumns = await db.getAllAsync<{ name: string }>(
    'PRAGMA table_info(daily_duas)'
  );
  if (!duaColumns.some((column) => column.name === 'category')) {
    await db.execAsync('ALTER TABLE daily_duas ADD COLUMN category TEXT');
  }

  // ---- TAMBAHAN: isi awal doa & dzikir (hanya jika tabel masih kosong) ----
  const jumlahDoa = await db.getFirstAsync<{ n: number }>(
    'SELECT COUNT(*) AS n FROM daily_duas'
  );
  if (!jumlahDoa || jumlahDoa.n === 0) {
    await db.withTransactionAsync(async () => {
      for (const d of DUAS) {
        await db.runAsync(
          'INSERT INTO daily_duas (id, title, arabic, latin, translation, category) VALUES (?, ?, ?, ?, ?, ?)',
          [d.id, d.title, d.arabic, d.latin, d.translation, d.category]
        );
      }
    });
  }
}