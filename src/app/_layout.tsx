import { C } from '@/constants/palette';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import type { ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { initDatabase } from '../../database/initDatabase';

type NamaIcon = keyof typeof Ionicons.glyphMap;

const ikon = (aktif: NamaIcon, mati: NamaIcon) =>
  function TabIcon({ color, focused }: { color: ColorValue; focused: boolean }) {
    return <Ionicons name={focused ? aktif : mati} size={24} color={color as string} />;
  };

export default function RootLayout() {
  const insets = useSafeAreaInsets();
  const bawah = Math.max(insets.bottom, 8);

  return (
    <SQLiteProvider databaseName="sholaty.db" onInit={initDatabase}>
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: C.gold,
          tabBarInactiveTintColor: C.goldSoft,
          tabBarStyle: {
            backgroundColor: C.deep,
            borderTopColor: C.gold,
            borderTopWidth: 1,
            height: 56 + bawah,
            paddingTop: 6,
            paddingBottom: bawah,
          },
          tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
        }}>
        <Tabs.Screen name="index" options={{ title: 'Beranda', tabBarIcon: ikon('home', 'home-outline') }} />
<Tabs.Screen name="qibla" options={{ title: 'Kiblat', tabBarIcon: ikon('compass', 'compass-outline') }} />
<Tabs.Screen name="dhikr" options={{ title: 'Dzikir', tabBarIcon: ikon('sparkles', 'sparkles-outline') }} />
<Tabs.Screen name="checklist" options={{ title: 'Checklist', tabBarIcon: ikon('checkbox', 'checkbox-outline') }} />
<Tabs.Screen name="settings" options={{ title: 'Pengaturan', tabBarIcon: ikon('settings', 'settings-outline') }} />
        {/* halaman bawaan template, disembunyikan dari tab bar */}
        <Tabs.Screen name="explore" options={{ href: null }} />
      </Tabs>
    </SQLiteProvider>
  );
}