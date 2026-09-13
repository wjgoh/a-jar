import { StyleSheet, Text, View } from 'react-native';
import { C } from '../lib/theme';

// Tiny View-drawn icons — zero dependencies, same 8pt language as the app.

export function JarGlyph({ size = 18, color = '#fff', fill = 0.7 }: { size?: number; color?: string; fill?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size * 1.25,
        borderRadius: size * 0.3,
        borderWidth: 2,
        borderColor: color,
        overflow: 'hidden',
        justifyContent: 'flex-end',
      }}
    >
      <View style={{ height: `${Math.round(fill * 100)}%`, backgroundColor: color }} />
    </View>
  );
}

export function CalendarGlyph({ size = 22, color = '#A1A1AA' }: { size?: number; color?: string }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: color,
        padding: 3,
        gap: 3,
      }}
    >
      <View style={{ height: 2, borderRadius: 1, backgroundColor: color }} />
      <View style={{ flexDirection: 'row', gap: 3 }}>
        <View style={{ width: 3, height: 3, borderRadius: 2, backgroundColor: color }} />
        <View style={{ width: 3, height: 3, borderRadius: 2, backgroundColor: color }} />
        <View style={{ width: 3, height: 3, borderRadius: 2, backgroundColor: color }} />
      </View>
    </View>
  );
}

export function DotsGlyph({ size = 22, color = '#A1A1AA' }: { size?: number; color?: string }) {
  const d = 4;
  return (
    <View style={{ width: size, height: size, justifyContent: 'space-between', padding: 2 }}>
      {[0, 1, 2].map((r) => (
        <View key={r} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {[0, 1, 2].map((c) => (
            <View key={c} style={{ width: d, height: d, borderRadius: 2, backgroundColor: color, opacity: r === 1 && c === 1 ? 1 : 0.55 }} />
          ))}
        </View>
      ))}
    </View>
  );
}

export function LockGlyph({ size = 12, color = '#71717A' }: { size?: number; color?: string }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center' }}>
      <View
        style={{
          width: size * 0.55,
          height: size * 0.5,
          borderWidth: 1.5,
          borderColor: color,
          borderBottomWidth: 0,
          borderTopLeftRadius: 4,
          borderTopRightRadius: 4,
        }}
      />
      <View style={{ width: size * 0.85, height: size * 0.55, borderRadius: 2, backgroundColor: color, marginTop: -1 }} />
    </View>
  );
}

export function LeafGlyph({ size = 12, color = C.green }: { size?: number; color?: string }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderTopRightRadius: 1,
        backgroundColor: color,
        transform: [{ rotate: '45deg' }],
      }}
    />
  );
}

/** Inline text glyphs (text presentation, no emoji font): arrows, spark, reset. */
export function G({ ch, size = 14, color = C.ink, bold = true }: { ch: string; size?: number; color?: string; bold?: boolean }) {
  return <Text style={[s.g, { fontSize: size, color, fontWeight: bold ? '800' : '400' }]}>{ch}</Text>;
}

const s = StyleSheet.create({
  g: { lineHeight: undefined },
});
