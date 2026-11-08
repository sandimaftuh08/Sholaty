import type { SQLiteDatabase } from 'expo-sqlite';

import { daysAgo, ymd } from './dates';
import { supabase } from './supabase';

type AnyRecord = Record<string, unknown>;

let pending: Promise<string | null> | null = null;

async function resolveUserId(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getSession();
    if (data.session) return data.session.user.id;
    const { data: d, error } = await supabase.auth.signInAnonymously();
    if (error) return null;
    return d.user?.id ?? null;
  } catch {
    return null;
  }
}

// Panggilan bersamaan berbagi satu proses login, supaya tidak terbentuk pengguna ganda
function getUserId(): Promise<string | null> {
  if (!pending) {
    pending = resolveUserId().finally(() => {
      pending = null;
    });
  }
  return pending;
}

export async function pushLog(
  name: string,
  date: string,
  done: boolean,
  at: string | null,
): Promise<boolean> {
  try {
    const uid = await getUserId();
    if (!uid) return false;
    const { error } = await supabase.from('prayer_logs').upsert({
      user_id: uid,
      prayer_name: name,
      prayer_date: date,
      is_completed: done,
      completed_at: at,
    });
    return !error;
  } catch {
    return false;
  }
}

export async function pushFavorite(duaId: number, on: boolean): Promise<boolean> {
  try {
    const uid = await getUserId();
    if (!uid) return false;
    const q = on
      ? await supabase.from('favorites').upsert({ user_id: uid, dua_id: duaId })
      : await supabase.from('favorites').delete().eq('user_id', uid).eq('dua_id', duaId);
    return !q.error;
  } catch {
    return false;
  }
}

export async function pushSettings(s: AnyRecord): Promise<boolean> {
  try {
    const uid = await getUserId();
    if (!uid) return false;
    const { error } = await supabase
      .from('app_settings')
      .upsert({ user_id: uid, data: s, updated_at: new Date().toISOString() });
    return !error;
  } catch {
    return false;
  }
}

export async function pullSettings(): Promise<AnyRecord | null> {
  try {
    const uid = await getUserId();
    if (!uid) return null;
    const { data, error } = await supabase
      .from('app_settings')
      .select('data')
      .eq('user_id', uid)
      .maybeSingle();
    if (error || !data) return null;
    return data.data as AnyRecord;
  } catch {
    return null;
  }
}

/** Kirim data HP (30 hari terakhir), lalu ambil data cloud yang belum ada di HP. Data HP diutamakan. */
export async function syncLogs(db: SQLiteDatabase): Promise<boolean> {
  try {
    const uid = await getUserId();
    if (!uid) return false;
    const since = ymd(daysAgo(30));

    const local = await db.getAllAsync<{
      prayer_name: string;
      prayer_date: string;
      is_completed: number;
      completed_at: string | null;
    }>(
      'SELECT prayer_name, prayer_date, is_completed, completed_at FROM prayer_logs WHERE prayer_date >= ?',
      [since],
    );

    if (local.length > 0) {
      const { error } = await supabase.from('prayer_logs').upsert(
        local.map((r) => ({
          user_id: uid,
          prayer_name: r.prayer_name,
          prayer_date: r.prayer_date,
          is_completed: r.is_completed === 1,
          completed_at: r.completed_at,
        })),
      );
      if (error) return false;
    }

    const { data, error } = await supabase
      .from('prayer_logs')
      .select('prayer_name, prayer_date, is_completed, completed_at')
      .gte('prayer_date', since);
    if (error || !data) return false;

    for (const r of data) {
      await db.runAsync(
        `INSERT OR IGNORE INTO prayer_logs (prayer_name, prayer_date, is_completed, completed_at)
         VALUES (?, ?, ?, ?)`,
        [r.prayer_name, r.prayer_date, r.is_completed ? 1 : 0, r.completed_at],
      );
    }
    return true;
  } catch {
    return false;
  }
}