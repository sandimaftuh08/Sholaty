import { Tabs } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { C } from '@/constants/palette';
import { initDatabase } from '../../database/initDatabase';

const emoji = (icon: string) =>
  function TabIcon({ focused }: { focused: boolean }) {
    return <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.55 }}>{icon}</Text>;
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
        <Tabs.Screen name="index" options={{ title: 'Beranda', tabBarIcon: emoji('🏠') }} />
        <Tabs.Screen name="qibla" options={{ title: 'Kiblat', tabBarIcon: emoji('🧭') }} />
        <Tabs.Screen name="dhikr" options={{ title: 'Dzikir', tabBarIcon: emoji('📿') }} />
        <Tabs.Screen name="checklist" options={{ title: 'Checklist', tabBarIcon: emoji('✅') }} />
        <Tabs.Screen name="settings" options={{ title: 'Pengaturan', tabBarIcon: emoji('⚙️') }} />
        {/* halaman bawaan template, disembunyikan dari tab bar */}
        <Tabs.Screen name="explore" options={{ href: null }} />
      </Tabs>
    </SQLiteProvider>
  );
}