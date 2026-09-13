import { StyleSheet, Text, View } from 'react-native';
import { C } from '../lib/theme';
import type { Tab } from '../state/useJar';
import { CalendarGlyph, DotsGlyph, JarGlyph } from './icons';
import { P } from './P';

const TABS: { id: Tab; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'Week' },
  { id: 'dots', label: 'Dots' },
];

function TabIcon({ id, active }: { id: Tab; active: boolean }) {
  const color = active ? C.ink : '#A1A1AA';
  if (id === 'today') return <JarGlyph size={20} color={color} fill={0.7} />;
  if (id === 'week') return <CalendarGlyph size={22} color={color} />;
  return <DotsGlyph size={22} color={color} />;
}

export default function BottomNav({ tab, onTab }: { tab: Tab; onTab: (t: Tab) => void }) {
  return (
    <View style={n.wrap}>
      <View style={n.bar}>
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <P key={t.id} onPress={() => onTab(t.id)} style={n.item} hitSlop={4} scale={0.94}>
              <TabIcon id={t.id} active={active} />
              <Text style={[n.label, active && { color: C.ink, fontWeight: '800' }]}>{t.label}</Text>
              {active && <View style={n.pill} />}
            </P>
          );
        })}
      </View>
    </View>
  );
}

const n = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 24,
    alignItems: 'center',
    pointerEvents: 'box-none',
    paddingHorizontal: 16,
  },
  bar: {
    width: '100%',
    maxWidth: 398,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: C.line,
    paddingVertical: 8,
    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
    elevation: 8,
  },
  item: { flex: 1, alignItems: 'center', gap: 2, minHeight: 56, justifyContent: 'center' },
  label: { fontSize: 10, fontWeight: '700', color: '#A1A1AA', letterSpacing: 1, textTransform: 'uppercase' },
  pill: { width: 16, height: 3, borderRadius: 2, backgroundColor: C.ink, marginTop: 2 },
});
