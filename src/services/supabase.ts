import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Saat Expo Router merender web di server (Node), "window" tidak ada,
// jadi penyimpanan sesi (AsyncStorage) tidak boleh dipakai di sana.
// Di HP dan di browser, window tersedia sehingga sesi tetap tersimpan.
const adaDiPerangkat = typeof window !== 'undefined';

export const supabase = createClient(url, key, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: adaDiPerangkat,
    persistSession: adaDiPerangkat,
    detectSessionInUrl: false,
  },
});