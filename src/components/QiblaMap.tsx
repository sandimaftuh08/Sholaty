import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { buatHtmlPeta } from '../services/mapHtml';

type Props = { latitude: number; longitude: number };

// Versi Android / iOS (Expo Go)
export default function QiblaMap({ latitude, longitude }: Props) {
  const html = useMemo(() => buatHtmlPeta(latitude, longitude), [latitude, longitude]);

  return (
    <View style={styles.wrap}>
      <WebView
        originWhitelist={['*']}
        source={{ html, baseUrl: 'https://localhost' }}
        style={{ flex: 1, backgroundColor: '#E6F0EA' }}
        javaScriptEnabled
        domStorageEnabled
        nestedScrollEnabled
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { height: 300, borderRadius: 18, overflow: 'hidden', backgroundColor: '#E6F0EA' },
});