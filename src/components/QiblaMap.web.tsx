import { createElement, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { buatHtmlPeta } from './mapHtml';

type Props = { latitude: number; longitude: number };

// Versi web (browser)
export default function QiblaMap({ latitude, longitude }: Props) {
  const html = useMemo(() => buatHtmlPeta(latitude, longitude), [latitude, longitude]);

  return (
    <View style={styles.wrap}>
      {createElement('iframe', {
        srcDoc: html,
        title: 'Peta arah kiblat',
        style: { border: 0, width: '100%', height: '100%' },
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { height: 300, borderRadius: 18, overflow: 'hidden', backgroundColor: '#E6F0EA' },
});