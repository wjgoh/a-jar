import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { BREAKDOWN } from '../data/maya';
import { C, jarColor } from '../lib/theme';
import { P } from './P';

interface Props {
  value: number;
  state: string;
  heaviest: string;
  why: string;
  fixed: boolean;
  open: boolean;
  onToggle: () => void;
}

/** Smoothly tweens the displayed number toward target (no deps, Animated API). */
function useTween(target: number): number {
  const [display, setDisplay] = useState(target);
  const v = useRef(new Animated.Value(target)).current;
  const anim = useRef<Animated.CompositeAnimation | null>(null);
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      v.setValue(target);
      setDisplay(target);
      return;
    }
    anim.current?.stop();
    const id = v.addListener(({ value }) => setDisplay(Math.round(value)));
    anim.current = Animated.timing(v, {
      toValue: target,
      duration: 1200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });
    anim.current.start();
    // Safety net for janky devices: guarantee we land exactly on target.
    const fallback = setTimeout(() => {
      anim.current?.stop();
      v.setValue(target);
      setDisplay(target);
    }, 1700);
    return () => {
      v.removeListener(id);
      clearTimeout(fallback);
    };
  }, [target]);
  return display;
}

const DROPS = Array.from({ length: 10 }, (_, i) => {
  const a = (i / 10) * Math.PI * 2;
  return {
    x: 50 + Math.cos(a) * 32,
    y: 38 + Math.sin(a) * 28,
    dx: Math.cos(a) * 72,
    dy: Math.sin(a) * 52,
    size: 6 + (i % 3) * 3,
    delay: i * 0.04,
  };
});

/** The namesake object, crafted: lid, glass body, liquid level, shine streak. */
function JarVessel({ level, color }: { level: number; color: string }) {
  return (
    <View style={j.wrap}>
      <View style={j.lid} />
      <View style={j.body}>
        <View style={[j.liquid, { backgroundColor: color, height: `${Math.min(level, 100)}%` }]} />
        <View style={j.shine} />
      </View>
    </View>
  );
}

export default function JarCard({ value, state, heaviest, why, fixed, open, onToggle }: Props) {
  const display = useTween(value);
  const color = jarColor(display);
  const burstColor = jarColor(value);
  const lines = fixed ? [...BREAKDOWN.slice(0, -1), '= 71% filling', 'free play — math moves only via Fix'] : BREAKDOWN;
  const mathLabel = open ? 'Hide the math ↑' : fixed ? 'See the math — why 71? ↓' : 'See the math — why 94? ↓';

  // Celebration: liquid splash + gentle pulse the moment a fix lands.
  const burst = useRef(new Animated.Value(0)).current;
  const [burstOn, setBurstOn] = useState(false);
  const prevFixed = useRef(fixed);
  useEffect(() => {
    if (fixed && !prevFixed.current) {
      setBurstOn(true);
      burst.setValue(0);
      Animated.timing(burst, {
        toValue: 1,
        duration: 1500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start(() => setBurstOn(false));
    }
    prevFixed.current = fixed;
  }, [fixed]);

  return (
    <Animated.View
      style={{
        transform: [
          {
            scale: burst.interpolate({ inputRange: [0, 0.25, 1], outputRange: [1, 1.025, 1] }),
          },
        ],
      }}
    >
      <P onPress={onToggle} style={s.card} scale={0.99}>
        {burstOn &&
          DROPS.map((p, i) => (
            <Animated.View
              key={i}
              style={[
                s.drop,
                {
                  width: p.size,
                  height: p.size,
                  borderRadius: p.size / 2,
                  backgroundColor: burstColor,
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  opacity: burst.interpolate({
                    inputRange: [0, Math.min(0.25 + p.delay, 0.6), 1],
                    outputRange: [0, 1, 0],
                  }),
                  transform: [
                    { translateX: burst.interpolate({ inputRange: [0, 1], outputRange: [0, p.dx] }) },
                    { translateY: burst.interpolate({ inputRange: [0, 1], outputRange: [0, p.dy] }) },
                    { scale: burst.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1.1] }) },
                  ],
                },
              ]}
            />
          ))}
        <View style={s.row}>
          <View style={{ flex: 1 }}>
            <Text style={s.eyebrow}>Maya's week</Text>
            <Text style={s.pct}>
              {display}
              <Text style={s.pctSmall}>%</Text>
            </Text>
            <View style={s.statusRow}>
              <View style={[s.pill, { backgroundColor: `${color}1A` }]}>
                <Text style={[s.pillTx, { color }]}>{state}</Text>
              </View>
              <Text style={s.heavy}>heaviest · {heaviest}</Text>
            </View>
            <Text style={s.why}>{why}</Text>
          </View>
          <JarVessel level={display} color={color} />
        </View>
        {/* meter */}
        <View style={s.meter}>
          <View
            style={[
              s.meterFill,
              { width: `${Math.min((display / 115) * 100, 100)}%`, backgroundColor: color },
            ]}
          />
        </View>
        {open && (
          <View style={s.breakdown}>
            {lines.map((line) => (
              <Text key={line} style={s.line}>
                {line}
              </Text>
            ))}
          </View>
        )}
        <View style={s.mathBtn}>
          <Text style={s.mathTx}>{mathLabel}</Text>
        </View>
      </P>
    </Animated.View>
  );
}

const j = StyleSheet.create({
  wrap: { alignItems: 'center' },
  lid: { width: 40, height: 10, borderRadius: 5, backgroundColor: C.ink, marginBottom: 3 },
  body: {
    width: 84,
    height: 112,
    borderRadius: 24,
    borderWidth: 3.5,
    borderColor: C.ink,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    backgroundColor: '#fff',
  },
  liquid: { width: '100%' },
  shine: {
    position: 'absolute',
    left: 10,
    top: 12,
    bottom: 12,
    width: 9,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
});

const s = StyleSheet.create({
  card: {
    position: 'relative',
    backgroundColor: C.card,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: C.line,
  },
  drop: { position: 'absolute', zIndex: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  eyebrow: { fontSize: 11, fontWeight: '800', color: C.sub, letterSpacing: 1.5, textTransform: 'uppercase' },
  pct: { fontSize: 60, fontWeight: '800', color: C.ink, fontVariant: ['tabular-nums'], marginTop: 2 },
  pctSmall: { fontSize: 24, fontWeight: '700', color: C.sub },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  pillTx: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  heavy: { fontSize: 13, fontWeight: '600', color: C.sub },
  why: { fontSize: 14, color: C.sub, marginTop: 6, lineHeight: 20 },
  meter: { height: 8, borderRadius: 4, backgroundColor: '#F4F4F5', marginTop: 16, overflow: 'hidden' },
  meterFill: { height: 8, borderRadius: 4 },
  breakdown: { marginTop: 16, gap: 4, borderTopWidth: 1, borderTopColor: C.line, paddingTop: 12 },
  line: { fontSize: 13, color: C.sub, fontVariant: ['tabular-nums'] },
  mathBtn: {
    marginTop: 12,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#F4F4F5',
  },
  mathTx: { fontSize: 12, fontWeight: '700', color: C.sub },
});
