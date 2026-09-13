import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import BottomNav from './components/BottomNav';
import DotsScreen from './components/DotsScreen';
import { P } from './components/P';
import { FixSheet, LoggerSheet, MoveSheet, SplitSheet } from './components/Sheets';
import TodayScreen from './components/TodayScreen';
import WeekScreen from './components/WeekScreen';
import { C } from './lib/theme';
import { useJar } from './state/useJar';

export default function App() {
  const s = useJar();

  return (
    <SafeAreaView style={a.safe}>
      <StatusBar style="dark" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        scrollEnabled={!s.dragging}
        contentContainerStyle={a.scroll}
      >
        <View style={a.col}>
          {s.tab === 'today' && <TodayScreen s={s} />}
          {s.tab === 'week' && <WeekScreen s={s} />}
          {s.tab === 'dots' && <DotsScreen s={s} />}
        </View>
      </ScrollView>

      {/* toast */}
      {s.toast && (
        <View style={[a.toastWrap, { pointerEvents: 'none' as const }]}>
          <Text style={a.toast}>{s.toast}</Text>
        </View>
      )}

      {/* undo pill */}
      {s.undo && (
        <View style={a.undoWrap}>
          <View style={a.undo}>
            <Text style={a.undoTx}>Fixed 94 → 71 · drawing kept</Text>
            <P onPress={s.undoFix} style={a.undoBtn}>
              <Text style={a.undoBtnTx}>Undo {s.undo.left}s</Text>
            </P>
          </View>
        </View>
      )}

      <FixSheet s={s} />
      <SplitSheet s={s} />
      <LoggerSheet s={s} />
      <MoveSheet s={s} />

      <BottomNav tab={s.tab} onTab={s.setTab} />
    </SafeAreaView>
  );
}

const a = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { alignItems: 'center', paddingVertical: 14, paddingBottom: 120 },
  col: { width: '100%', maxWidth: 430, paddingHorizontal: 14 },
  toastWrap: { position: 'absolute', top: 60, left: 0, right: 0, alignItems: 'center', paddingHorizontal: 24 },
  toast: {
    backgroundColor: C.dark,
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    overflow: 'hidden',
    textAlign: 'center',
  },
  undoWrap: { position: 'absolute', left: 0, right: 0, bottom: 104, alignItems: 'center', paddingHorizontal: 16 },
  undo: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.dark, borderRadius: 16, paddingLeft: 16, paddingRight: 8, paddingVertical: 8 },
  undoTx: { fontSize: 13, fontWeight: '600', color: '#fff' },
  undoBtn: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 12, borderRadius: 10, backgroundColor: '#fff' },
  undoBtnTx: { fontSize: 12, fontWeight: '800', color: C.ink, fontVariant: ['tabular-nums'] },
});
