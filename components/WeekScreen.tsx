import { useRef } from 'react';
import { Animated, PanResponder, StyleSheet, Text, View } from 'react-native';
import { Block, DAYS, Day } from '../data/maya';
import { C } from '../lib/theme';
import { PARTS, fmtRange, partOf, toMin } from '../lib/time';
import { BucketZone, measureBuckets, regBucket, zoneFor } from '../lib/dropRegistry';
import type { JarStore } from '../state/useJar';
import { LeafGlyph, LockGlyph } from './icons';
import { P } from './P';

const ARM_MS = 380;

/** Movable card: tap opens the exact-time sheet, hold + drag moves it. */
function DragBlock({ b, s }: { b: Block; s: JarStore }) {
  const pan = useRef(new Animated.ValueXY()).current;
  const lift = useRef(new Animated.Value(0)).current;
  const live = useRef(b);
  live.current = b;
  const st = useRef<{ timer: ReturnType<typeof setTimeout> | null; armed: boolean; target: string | null; zones: BucketZone[] }>({
    timer: null,
    armed: false,
    target: null,
    zones: [],
  });

  const active = s.dragging === b.id;

  const disarm = () => {
    if (st.current.timer) clearTimeout(st.current.timer);
    st.current.timer = null;
    st.current.armed = false;
  };

  const responder = useRef(
    PanResponder.create({
      // Claim on touch-down so a tap can open the detail sheet;
      // ScrollView may steal it back for scrolling until we arm.
      onStartShouldSetPanResponder: () => {
        st.current.timer = setTimeout(async () => {
          st.current.armed = true;
          s.beginDrag(live.current.id);
          Animated.spring(lift, { toValue: 1, useNativeDriver: false }).start();
          // Pads render on beginDrag and shift headers — measure after.
          setTimeout(async () => {
            st.current.zones = await measureBuckets();
          }, 80);
        }, ARM_MS);
        return true;
      },
      onPanResponderTerminationRequest: () => !st.current.armed,
      onPanResponderGrant: () => {},
      onPanResponderMove: (_, g) => {
        if (!st.current.armed) return;
        pan.setValue({ x: g.dx, y: g.dy });
        const key = zoneFor(g.moveY, st.current.zones);
        st.current.target = key;
        s.setDragOver(key);
      },
      onPanResponderRelease: () => {
        const wasArmed = st.current.armed;
        const target = st.current.target;
        const cur = live.current;
        disarm();
        Animated.spring(lift, { toValue: 0, useNativeDriver: false }).start();
        pan.setValue({ x: 0, y: 0 });
        if (wasArmed) {
          if (target) {
            const [day, part] = target.split(':');
            const p = PARTS.find((x) => x.id === part);
            // Dropping home = cancel, no toast.
            if (p && !(day === cur.day && p.time === cur.time)) {
              s.moveBlock(cur.id, day as Day, p.time);
            }
          }
          s.endDrag();
        } else {
          s.openDetail(cur.id);
        }
      },
      onPanResponderTerminate: () => {
        disarm();
        pan.setValue({ x: 0, y: 0 });
        lift.setValue(0);
        s.endDrag();
      },
    }),
  ).current;

  return (
    <Animated.View
      {...responder.panHandlers}
      style={[
        w.block,
        b.weight === 'heavy' && w.heavy,
        active && w.lifting,
        {
          transform: [...pan.getTranslateTransform(), { scale: lift.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] }) }],
          zIndex: active ? 2 : 0,
        },
      ]}
    >
      <View style={w.blockTop}>
        <Text style={w.time}>{fmtRange(b.time, b.durationMin)}</Text>
        <Text style={w.label} numberOfLines={1}>
          {b.label}
        </Text>
      </View>
    </Animated.View>
  );
}

function Row({ b, s }: { b: Block; s: JarStore }) {
  if (b.kind === 'movable') return <DragBlock b={b} s={s} />;
  if (b.kind === 'locked') {
    // Inert on purpose: grey never promises interactivity.
    return (
      <View style={[w.block, w.locked, b.weight === 'heavy' && w.heavy]}>
        <View style={w.blockTop}>
          <LockGlyph />
          <Text style={[w.time, { color: '#A1A1AA' }]}>{fmtRange(b.time, b.durationMin)}</Text>
          <Text style={[w.label, { color: '#71717A' }]} numberOfLines={1}>
            {b.label}
          </Text>
        </View>
      </View>
    );
  }
  return (
    <P
      onPress={() => s.tapBlock(b.id)}
      style={[w.block, w.refill, b.weight === 'heavy' && w.heavy]}
    >
      <View style={w.blockTop}>
        <LeafGlyph />
        <Text style={w.time}>{fmtRange(b.time, b.durationMin)}</Text>
        <Text style={w.label} numberOfLines={1}>
          {b.label}
        </Text>
      </View>
    </P>
  );
}

function Bucket({ day, partId, blocks, s }: { day: Day; partId: string; blocks: Block[]; s: JarStore }) {
  const part = PARTS.find((p) => p.id === partId)!;
  const key = `${day}:${part.id}`;
  const list = blocks
    .filter((b) => partOf(b.time) === part.id)
    .sort((a, b) => toMin(a.time) - toMin(b.time));
  const over = !!s.dragging && s.dragOver === key;
  return (
    <View>
      <View ref={(el) => regBucket(key, el)} collapsable={false} style={w.partHead}>
        <Text style={w.partTx}>
          {part.label.toUpperCase()}
          {list.length === 0 ? ' · OPEN' : ''}
        </Text>
      </View>
      {list.map((b) => (
        <Row key={b.id} b={b} s={s} />
      ))}
      {!!s.dragging && (
        <View style={[w.pad, over && w.padHot]}>
          <Text style={[w.padTx, over && { color: '#15803D' }]}>{over ? `▼ Drop ${part.label.toLowerCase()}` : `○ ${part.label}`}</Text>
        </View>
      )}
    </View>
  );
}

function DaySection({ day, s }: { day: Day; s: JarStore }) {
  const blocks = s.blocks.filter((b) => b.day === day);
  const hot = day === 'Tue' && !s.fixed && !s.split;
  const hasEssay = day === 'Tue' && blocks.some((b) => b.id === 'tue-essay');
  return (
    <View style={[w.day, hot && w.hotDay]}>
      <View style={w.dayHead}>
        <Text style={[w.dayName, hot && { color: C.red }]}>{day}</Text>
        {hot && <Text style={w.hotTag}>94% · heaviest</Text>}
      </View>
      {PARTS.map((p) => (
        <Bucket key={p.id} day={day} partId={p.id} blocks={blocks} s={s} />
      ))}
      {hasEssay && (
        <P onPress={() => s.setSheet('split')} style={w.splitBtn} hitSlop={8}>
          <Text style={w.splitTx}>Split the essay</Text>
        </P>
      )}
      {blocks.length === 0 && !s.dragging && <Text style={w.empty}>— light day —</Text>}
    </View>
  );
}

export default function WeekScreen({ s }: { s: JarStore }) {
  return (
    <View style={w.wrap}>
      <Text style={w.title}>Week</Text>
      <Text style={w.sub}>Hold a white block to drag it · tap for exact time.</Text>
      <Text style={w.free}>Free play — the math moves only via Fix.</Text>
      {/* legend — judges get the encoding in one glance */}
      <View style={w.legend}>
        <View style={w.legRow}>
          <View style={[w.swatch, { backgroundColor: '#E4E4E7' }]}>
            <LockGlyph />
          </View>
          <Text style={w.legTx}>Fixed — class, shift, exam can't move</Text>
        </View>
        <View style={w.legRow}>
          <View style={[w.swatch, { backgroundColor: '#fff', borderColor: C.ink }]} />
          <Text style={w.legTx}>Movable — hold to drag, tap for exact time</Text>
        </View>
        <View style={w.legRow}>
          <View style={[w.swatch, { backgroundColor: '#F0FDF4', borderColor: C.green }]}>
            <LeafGlyph />
          </View>
          <Text style={w.legTx}>Refill — sleep, drawing. Never deleted</Text>
        </View>
      </View>
      {DAYS.map((day) => (
        <DaySection key={day} day={day} s={s} />
      ))}
      <View style={{ height: 96 }} />
    </View>
  );
}

const w = StyleSheet.create({
  wrap: { gap: 12, paddingBottom: 16 },
  title: { fontSize: 24, fontWeight: '800', color: C.ink },
  sub: { fontSize: 13, color: C.sub, marginTop: -8 },
  free: { fontSize: 12, color: '#A1A1AA', marginTop: -6 },
  legend: { backgroundColor: C.card, borderRadius: 16, padding: 12, borderWidth: 1, borderColor: C.line, gap: 8 },
  legRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  swatch: {
    width: 28,
    height: 28,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: C.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legTx: { fontSize: 12, fontWeight: '600', color: C.ink, flex: 1 },
  day: { backgroundColor: C.card, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: C.line, gap: 4 },
  hotDay: { borderColor: C.red, borderWidth: 1.5 },
  dayHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  dayName: { fontSize: 15, fontWeight: '800', color: C.ink, letterSpacing: 1, textTransform: 'uppercase' },
  hotTag: { fontSize: 12, fontWeight: '700', color: C.red },
  partHead: { marginTop: 8, marginBottom: 2 },
  partTx: { fontSize: 10, fontWeight: '800', color: '#A1A1AA', letterSpacing: 1.5 },
  block: {
    borderRadius: 14,
    padding: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: C.line,
    borderLeftWidth: 3,
    borderLeftColor: '#D4D4D8',
    marginVertical: 4,
  },
  locked: { backgroundColor: '#F4F4F5' },
  refill: { borderColor: C.green, borderLeftColor: C.green, backgroundColor: '#F0FDF4' },
  lifting: { borderColor: C.ink, borderLeftColor: C.ink, borderWidth: 2 },
  heavy: { borderLeftWidth: 6 },
  blockTop: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  time: { fontSize: 12, fontWeight: '700', color: C.sub, fontVariant: ['tabular-nums'] },
  label: { fontSize: 14, fontWeight: '600', color: C.ink, flex: 1 },
  pad: {
    borderRadius: 14,
    padding: 12,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: C.green,
    backgroundColor: '#F0FDF4',
    marginVertical: 4,
  },
  padTx: { fontSize: 13, fontWeight: '700', color: C.green },
  padHot: { backgroundColor: '#DCFCE7', borderColor: '#15803D', borderWidth: 2 },
  splitBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    minHeight: 44,
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: C.dark,
    marginTop: 8,
  },
  splitTx: { fontSize: 12, fontWeight: '800', color: '#fff' },
  empty: { fontSize: 13, color: '#A1A1AA' },
});
