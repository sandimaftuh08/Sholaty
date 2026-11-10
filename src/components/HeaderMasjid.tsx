import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

const EMAS = '#C9A24B';
const EMAS_MUDA = '#E8D3A0';
const LANGIT = '#0B3D2E';
const SILUET = '#082B20';
const SILUET_MUDA = '#0F4A38';

type Props = { tanggal: string };

export default function HeaderMasjid({ tanggal }: Props) {
  return (
    <View style={styles.header}>
      {/* langit: bintang dan bulan sabit */}
      <View style={styles.langit} pointerEvents="none">
        <Svg width="100%" height="100%" viewBox="0 0 280 120">
          <Circle cx="40" cy="30" r="1.2" fill={EMAS_MUDA} opacity={0.8} />
          <Circle cx="70" cy="62" r="1" fill={EMAS_MUDA} opacity={0.6} />
          <Circle cx="22" cy="86" r="1.3" fill={EMAS_MUDA} opacity={0.7} />
          <Circle cx="104" cy="18" r="1" fill={EMAS_MUDA} opacity={0.6} />
          <Circle cx="176" cy="22" r="1.2" fill={EMAS_MUDA} opacity={0.7} />
          <Circle cx="206" cy="70" r="1" fill={EMAS_MUDA} opacity={0.6} />
          <Circle cx="250" cy="96" r="1.3" fill={EMAS_MUDA} opacity={0.7} />
          <Circle cx="262" cy="14" r="1" fill={EMAS_MUDA} opacity={0.6} />
          <Circle cx="238" cy="40" r="14" fill={EMAS} />
          <Circle cx="244" cy="36" r="12" fill={LANGIT} />
        </Svg>
      </View>

      {/* teks */}
      <View style={styles.teks}>
        <Text style={styles.bismillah}>بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ</Text>
        <Text style={styles.logo}>Sholaty</Text>
        <Text style={styles.sapaan}>Assalamu'alaikum, yuk jaga sholat</Text>
        <View style={styles.pilTanggal}>
          <Ionicons name="calendar-outline" size={14} color={EMAS_MUDA} />
          <Text style={styles.pilTanggalTeks}>{tanggal}</Text>
        </View>
      </View>

      {/* siluet masjid */}
      <View style={styles.masjid}>
        <Svg width="100%" height="100%" viewBox="0 0 280 110">
          <Path d="M0 80 V64 Q0 52 12 52 Q24 52 24 64 V80 Z" fill={SILUET_MUDA} />
          <Path d="M256 80 V64 Q256 52 268 52 Q280 52 280 64 V80 Z" fill={SILUET_MUDA} />
          <Rect x="0" y="80" width="280" height="30" fill={SILUET} />
          <Rect x="24" y="66" width="232" height="44" fill={SILUET} />

          {/* menara kiri */}
          <Rect x="26" y="34" width="8" height="46" fill={SILUET} />
          <Rect x="23" y="46" width="14" height="3" fill={SILUET} />
          <Path d="M26 34 L30 14 L34 34 Z" fill={SILUET} />
          <Circle cx="30" cy="11" r="2.6" fill={EMAS} />

          {/* menara kanan */}
          <Rect x="246" y="34" width="8" height="46" fill={SILUET} />
          <Rect x="243" y="46" width="14" height="3" fill={SILUET} />
          <Path d="M246 34 L250 14 L254 34 Z" fill={SILUET} />
          <Circle cx="250" cy="11" r="2.6" fill={EMAS} />

          {/* kubah samping */}
          <Path d="M60 66 Q60 44 80 44 Q100 44 100 66 Z" fill={SILUET} stroke={EMAS} strokeWidth={1} strokeOpacity={0.8} />
          <Path d="M180 66 Q180 44 200 44 Q220 44 220 66 Z" fill={SILUET} stroke={EMAS} strokeWidth={1} strokeOpacity={0.8} />

          {/* kubah utama */}
          <Path d="M100 66 Q100 20 140 20 Q180 20 180 66 Z" fill={SILUET} stroke={EMAS} strokeWidth={1.2} strokeOpacity={0.9} />
          <Rect x="139.4" y="8" width="1.2" height="12" fill={EMAS} />
          <Circle cx="140" cy="6" r="4" fill={EMAS} />
          <Circle cx="141.6" cy="5" r="3.3" fill={LANGIT} />

          {/* jendela menyala */}
          <Path d="M122 80 V72 Q125 66 128 72 V80 Z" fill={EMAS} opacity={0.9} />
          <Path d="M137 80 V70 Q140 63 143 70 V80 Z" fill={EMAS} opacity={0.95} />
          <Path d="M152 80 V72 Q155 66 158 72 V80 Z" fill={EMAS} opacity={0.9} />
          <Path d="M77 80 V73 Q80 68 83 73 V80 Z" fill={EMAS} opacity={0.8} />
          <Path d="M197 80 V73 Q200 68 203 73 V80 Z" fill={EMAS} opacity={0.8} />
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: LANGIT,
    paddingTop: 22,
    overflow: 'hidden',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  langit: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    aspectRatio: 280 / 120,
  },
  teks: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  bismillah: {
    fontSize: 14,
    color: EMAS_MUDA,
    textAlign: 'center',
  },
  logo: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 4,
    marginTop: 8,
  },
  sapaan: {
    fontSize: 14,
    color: EMAS_MUDA,
    marginTop: 8,
    fontWeight: '600',
  },
  pilTanggal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(201,162,75,0.5)',
    backgroundColor: 'rgba(201,162,75,0.15)',
  },
  pilTanggalTeks: {
    color: EMAS_MUDA,
    fontSize: 12,
  },
  masjid: {
    width: '100%',
    aspectRatio: 280 / 110,
    marginTop: 10,
  },
});