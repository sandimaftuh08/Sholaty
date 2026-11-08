import type { SQLiteDatabase } from 'expo-sqlite';

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
}
