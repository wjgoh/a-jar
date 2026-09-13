import { useEffect, useRef, useState } from 'react';
import {
  Block,
  Day,
  DOTS_HISTORY,
  DotDay,
  FIX,
  INITIAL_BLOCKS,
  INITIAL_WEEK,
  JAR_AFTER,
  JAR_BEFORE,
  MorningTag,
  NightTag,
  SPLIT,
} from '../data/maya';
import { fmtT, toMin } from '../lib/time';

export type Sheet = 'none' | 'fix' | 'split' | 'morning' | 'night' | 'move';
export type Tab = 'today' | 'week' | 'dots';

interface UndoState {
  blocks: Block[];
  left: number;
}

const SPLIT_MIN = [30, 60, 45];

export function useJar() {
  const [tab, setTab] = useState<Tab>('today');
  const [blocks, setBlocks] = useState<Block[]>(INITIAL_BLOCKS);
  const [fixed, setFixed] = useState(false);
  const [split, setSplit] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [sheet, setSheet] = useState<Sheet>('none');
  const [toast, setToast] = useState<string | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const [week, setWeek] = useState<DotDay[]>(INITIAL_WEEK);
  const [undo, setUndo] = useState<UndoState | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const jar = fixed ? JAR_AFTER : JAR_BEFORE;

  // --- toast auto-dismiss ---
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  // --- undo countdown ---
  useEffect(() => {
    if (!undo) return;
    timer.current = setInterval(() => {
      setUndo((u) => {
        if (!u) return u;
        if (u.left <= 1) {
          if (timer.current) clearInterval(timer.current);
          return null;
        }
        return { ...u, left: u.left - 1 };
      });
    }, 1000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [undo !== null]);

  function reset() {
    if (timer.current) clearInterval(timer.current);
    setBlocks(INITIAL_BLOCKS);
    setFixed(false);
    setSplit(false);
    setDetailId(null);
    setDragging(null);
    setDragOver(null);
    setSheet('none');
    setUndo(null);
    setWeek(INITIAL_WEEK);
    setBannerDismissed(false);
    setBreakdownOpen(false);
    setToast(null);
  }

  // --- refill tap: protected, never draggable ---
  function tapBlock(id: string) {
    const b = blocks.find((x) => x.id === id);
    if (!b) return;
    if (b.kind === 'refill') {
      setToast('Protected — rest stays, week plans around it.');
    }
  }

  // --- drag + detail-sheet moves: free play, jar math stays scripted ---
  function moveBlock(id: string, day: Day, time: string) {
    const b = blocks.find((x) => x.id === id);
    if (!b || b.kind !== 'movable') return;
    setBlocks((bs) => bs.map((x) => (x.id === id ? { ...x, day, time } : x)));
    setToast(`Moved ${b.label} → ${day} ${fmtT(toMin(time))}.`);
  }

  function openDetail(id: string) {
    const b = blocks.find((x) => x.id === id);
    if (!b || b.kind !== 'movable') return;
    setDetailId(id);
    setSheet('move');
  }

  function closeDetail() {
    setDetailId(null);
    setSheet('none');
  }

  function beginDrag(id: string) {
    const b = blocks.find((x) => x.id === id);
    if (!b || b.kind !== 'movable') return;
    setDragging(id);
    setDragOver(null);
  }

  function endDrag() {
    setDragging(null);
    setDragOver(null);
  }

  // --- Fix My Day ---
  function acceptFix() {
    setUndo({ blocks, left: 10 });
    setBlocks((bs) =>
      bs.map((b) => {
        if (b.id === 'tue-essay') return { ...b, day: 'Wed', time: '10:00' };
        if (b.id === 'tue-laundry') return { ...b, day: 'Fri', time: '11:00' };
        return b;
      }),
    );
    setFixed(true);
    setSheet('none');
    setDetailId(null);
  }

  function undoFix() {
    if (!undo) return;
    if (timer.current) clearInterval(timer.current);
    setBlocks(undo.blocks);
    setFixed(false);
    setUndo(null);
    setToast('Fix undone — back to 94%.');
  }

  // --- Split essay ---
  function acceptSplit() {
    const essay = blocks.find((b) => b.id === 'tue-essay');
    if (!essay) {
      setToast('Essay already spread.');
      setSheet('none');
      return;
    }
    setBlocks((bs) => [
      ...bs.filter((b) => b.id !== 'tue-essay'),
      ...SPLIT.map((p, i) => ({
        id: `split-${i}`,
        day: p.day,
        time: p.time,
        label: `Essay: ${p.label}`,
        kind: 'movable' as const,
        weight: 'light' as const,
        durationMin: SPLIT_MIN[i] ?? 30,
      })),
    ]);
    setSplit(true);
    setDetailId(null);
    setSheet('none');
    setToast('Essay spread across 3 days.');
  }

  // --- Dots logger ---
  function setDot(part: 'morning' | 'night', tag: MorningTag | NightTag) {
    setWeek((w) => {
      const next = [...w];
      const today = { ...next[1] }; // Tue = hero day
      if (part === 'morning') today.morning = tag as MorningTag;
      else today.night = tag as NightTag;
      next[1] = today;
      return next;
    });
    setSheet('none');
  }

  return {
    tab,
    setTab,
    blocks,
    jar,
    fixed,
    split,
    detailId,
    detail: blocks.find((b) => b.id === detailId) ?? null,
    dragging,
    dragOver,
    setDragOver,
    sheet,
    setSheet,
    toast,
    bannerDismissed,
    setBannerDismissed,
    breakdownOpen,
    setBreakdownOpen,
    week,
    history: DOTS_HISTORY,
    undo,
    fix: FIX,
    reset,
    tapBlock,
    moveBlock,
    openDetail,
    closeDetail,
    beginDrag,
    endDrag,
    acceptFix,
    undoFix,
    acceptSplit,
    setDot,
  };
}

export type JarStore = ReturnType<typeof useJar>;
