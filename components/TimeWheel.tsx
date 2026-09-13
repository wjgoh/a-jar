// iOS-style time wheel: tap an item or flick to spin, releases snap.
// Zero deps, works on web (tap always works; flick snaps on release).

import { useEffect, useRef } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleSheet, Text, View } from 'react-native';
import { C } from '../lib/theme';
import { P } from './P';

const H = 44;
const VISIBLE = 5;

function WheelColumn({
  items,
  index,
  onPick,
  label,
}: {
  items: string[];
  index: number;
  onPick: (i: number) => void;
  label: string;
}) {
  const ref = useRef<ScrollView>(null);
  const idx = useRef(index);
  idx.current = index;

  useEffect(() => {
    const t = setTimeout(() => ref.current?.scrollTo({ y: index * H, animated: false }), 60);
    return () => clearTimeout(t);
  }, []);

  const go = (i: number) => {
    const clamped = Math.max(0, Math.min(items.length - 1, i));
    if (clamped !== idx.current) onPick(clamped);
    ref.current?.scrollTo({ y: clamped * H, animated: true });
  };

  const snap = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    const i = Math.max(0, Math.min(items.length - 1, Math.round(y / H)));
    // Already settled: do nothing, or programmatic scrolls ping-pong forever.
    if (i === idx.current && Math.abs(y - i * H) < 1) return;
    if (i !== idx.current) onPick(i);
    ref.current?.scrollTo({ y: i * H, animated: true });
  };

  return (
    <View style={t.col}>
      <Text style={t.cap}>{label}</Text>
      <View style={t.window}>
        <View style={t.band} />
        <ScrollView
          ref={ref}
          showsVerticalScrollIndicator={false}
          snapToInterval={H}
          decelerationRate="fast"
          onMomentumScrollEnd={snap}
          onScrollEndDrag={snap}
        >
          <View style={{ height: (H * (VISIBLE - 1)) / 2 }} />
          {items.map((it, i) => (
            <P key={it} onPress={() => go(i)} style={t.item}>
              <Text style={[t.tx, i === index && t.txOn]}>{it}</Text>
            </P>
          ))}
          <View style={{ height: (H * (VISIBLE - 1)) / 2 }} />
        </ScrollView>
      </View>
    </View>
  );
}

export function TimeWheel({
  hour,
  minute,
  suffix,
  onHour,
  onMinute,
  onSuffix,
}: {
  hour: number; // 1-12
  minute: number; // 0-59
  suffix: 'am' | 'pm';
  onHour: (h: number) => void;
  onMinute: (m: number) => void;
  onSuffix: (s: 'am' | 'pm') => void;
}) {
  const hours = Array.from({ length: 12 }, (_, i) => `${i + 1}`);
  const minutes = Array.from({ length: 12 }, (_, i) => `${(i * 5).toString().padStart(2, '0')}`);
  return (
    <View style={t.row}>
      <WheelColumn label="Hour" items={hours} index={hour - 1} onPick={(i) => onHour(i + 1)} />
      <WheelColumn
        label="Min"
        items={minutes}
        index={Math.round(minute / 5) % 12}
        onPick={(i) => onMinute(i * 5)}
      />
      <WheelColumn
        label=""
        items={['AM', 'PM']}
        index={suffix === 'am' ? 0 : 1}
        onPick={(i) => onSuffix(i === 0 ? 'am' : 'pm')}
      />
    </View>
  );
}

const t = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  col: { flex: 1, alignItems: 'stretch' },
  cap: { fontSize: 10, fontWeight: '800', color: '#A1A1AA', letterSpacing: 1.5, textAlign: 'center', marginBottom: 4 },
  window: { height: H * VISIBLE, borderRadius: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: C.line, overflow: 'hidden' },
  band: { position: 'absolute', top: H * 2, height: H, left: 0, right: 0, backgroundColor: '#F4F4F5', pointerEvents: 'none' as const },
  item: { height: H, alignItems: 'center', justifyContent: 'center' },
  tx: { fontSize: 16, color: '#A1A1AA', fontVariant: ['tabular-nums'] },
  txOn: { fontSize: 20, fontWeight: '800', color: C.ink },
});
