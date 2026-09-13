# A Jar by [TODO: Team Name]
Team: [TODO: Member 1], [TODO: Member 2], [TODO: Member 3], [TODO: Member 4]

Problem Statement: Stress & Workload Manager

Video Presentation: [TODO: Unlisted Youtube Link]

Presentation Slides: [TODO: Public Link]

---

## 1. Project Overview

### The Problem

Students carry five loads at once — mental (exams, study), time (shifts, classes),
physical (no sleep), social (obligations), and errands (laundry, groceries).
Burnout is the pile-up, not one bad day. The stakeholders are working students
like Maya, our V1 persona, who juggles exam week with part-time shifts.

Similar apps fall short: **Google Calendar** shows *time* — where to be — but
nothing shows *load*, i.e. whether you will survive being there. **To-do apps**
(Todoist, TickTick) list tasks but shame you with streaks and red overdue counts
instead of showing which part of your week is full or what to move. **Habit
trackers** reward unbroken streaks, so rest feels guilty. Nothing answers the
real question: *how full is my week, and what single move fixes it?*

### Our Solution

A Jar visualizes your week as a vessel: a single fullness percentage, the
heaviest load type, and the reason in one sentence. When life breaks the plan —
an urgent shift cover lands on an exam-week Tuesday — one tap proposes a single
fix (move the heavy essay to a green Wednesday, push laundry to a light Friday,
keep drawing), and accepting it drops the jar from 94% to 71%. Morning/night
dots collect proof of what drains and refills you, never streaks, never shame.

Feature set:

- **Weekly jar** — fullness % (capped at 115%, purple when overflowing), state
  (filling / full / overflowing), heaviest load, why-sentence, expandable math receipt
- **Week planner** — Mon–Sun with three block kinds: locked (class/shift/exam,
  immovable), movable (study/errands, tap-to-move), refill (sleep/hobbies, green,
  never deleted)
- **Fix My Day** — one pre-computed suggestion + reason + Accept, with 10-second Undo
- **Split** — oversized blocks spread across green days (e.g. essay → outline Mon,
  draft Wed, polish Thu)
- **Dots proof grid** — morning ring / night fill per day plus 2-week history;
  skip = hollow, with captions surfacing learned patterns
- **Morning/night logger** — chip-based check-in (no typing, no shame)

---

## 2. Ideation & Process

### 2.1 Ideas We Considered

Ordered with chosen ideas first:

| Idea | Why it was dropped / kept |
|---|---|
| **A (Chosen): A Jar — checker + one-tap fix** | Kept. Smallest build carrying the full story: see fullness → accept one fix. |
| **B (Chosen): Expo cross-platform build** | Kept. One codebase serves the web demo now and an APK later; native Kotlin, Telegram bot, and pure PWA were all weighed and dropped. |
| C: Chat-based fixer MVP | Dropped. Contradicts the one-tap promise; adds friction, typing, and demo risk. |
| D: Streak-based tracking (Duolingo-style) | Dropped. Streaks shame rest days; locked proof-grid instead where skip = hollow. |
| E: Telegram bot platform | Dropped. Notifications-first; can't carry the jar/planner visual story. |
| F: Native Android (Kotlin) | Dropped. Full rewrite per platform; team size and timeline forbid it. |

Items scheduled for Phase 2 (real jar math, drag gestures, persistence, APK,
notifications) are deferred, not dropped — see §5.

### 2.2 Ideation Boards

![Problem tree](docs/img/problem-tree.png)
*Problem tree: burnout as a five-load pile-up; calendars show time, to-dos shame,
rest feels guilty — nothing shows load. The gap funnels into the jar insight.*

![Mindmap](docs/img/mindmap.png)
*Mindmap: problem branches, product branches (jar / fix / planner / dots),
audience (Maya → everyone), V1 cuts, and the V2 parking lot.*

![User flow](docs/img/user-flow.png)
*User flow: the 60-second demo path — cold load 94% → see the math → Fix sheet
→ Accept → 71% with drawing kept → dots proof.*

### 2.3 Mentor Consultation

| Date | Mentor | Feedback Received | What Was Changed |
|---|---|---|---|
| [TODO] | [TODO] | [TODO] | [TODO] |
| [TODO] | [TODO] | [TODO] | [TODO] |

---

## 3. Design & Prototype

UI Prototype: [TODO: Public Link]

![Today — jar hero](docs/img/screen-today.png)
*Cold load: 94% FULL, heaviest mental, why-sentence. Tapping the card expands the
math receipt (2h study = 40, 6h shift = 30, −drawing, fried yesterday).*

![Fix sheet](docs/img/screen-fix.png)
*Bottom sheet: reason plus before/after bars (94% red → 71% orange), the two
moves, the kept refill. Accept is the single primary action.*

![Fixed state](docs/img/screen-fixed.png)
*After Accept: number tweens 94→71 with a liquid splash, banner gone, essay on
Wed, laundry on Fri, drawing kept, Undo pill counting down from 10s.*

![Week planner](docs/img/screen-week.png)
*Legend (fixed / movable / refill) on top; Tue flagged red with the Split button
on the essay; dashed green slots glow while a block is picked up.*

![Split sheet](docs/img/screen-split.png)
*Essay spreads to outline Mon, draft Wed, polish Thu — one "Spread it" tap.*

![Dots proof](docs/img/screen-dots.png)
*Legend (ring = morning, fill = night, hollow = skipped), live week with
morning/night log buttons, 2-week history with proof captions.*

---

## 4. What Makes It Different

- **Capacity, not scheduling.** The jar answers "can I take this?" — calendars only answer "when is it?" No existing tool visualizes weekly load as one number.
- **Rest as infrastructure.** Refill blocks (sleep, drawing) are green, protected,
  never deletable — recovery is load-bearing, not leftover time. The Fix planner
  works *around* rest instead of eating it.
- **Proof, not streak.** Dots deliberately reject Duolingo mechanics: skip renders
  hollow with zero penalty, and captions surface learned patterns
  ("work+study drained you 3/3 last times") instead of guilt.
- **One collision, one fix.** The whole product is demonstrated through a single
  overloaded Tuesday and a single accepting tap — a before/after no dashboard of
  charts can match.

How we compare:

| | Google Calendar | To-do apps | A Jar |
|---|---|---|---|
| Shows time | Yes | Partial | Via planner |
| Shows load | No | No | **Yes — one %** |
| Suggests a fix | No | No | **Yes — one tap** |
| Protects rest | No | No | **Yes — refill blocks** |
| Shames skips | N/A | Yes (streaks) | **No — proof grid** |

---

## 5. Technical Architecture & Feasibility

### Tech stack

| Layer | Choice | Why + constraints |
|---|---|---|
| Frontend | Expo SDK 52, React Native, TypeScript | One codebase → web demo now, APK via EAS later. Constraint: SDK-pinned deps (react-native 0.76.x). |
| State | `useState` only, no store | Prototype needs no backend/sync; refresh may reset (allowed). |
| Styling | Plain `StyleSheet`, zero UI deps | Nothing to break on stage; icons are hand-drawn for dependency-free web bundling. |
| Animation | Built-in Animated API | Transform + opacity only, no libraries. |
| Data | Hardcoded Maya week, fake 94→71 | Disclosed prototype strategy: fake brains prove the interaction; real math is Phase 2. |
| Backend / DB / APIs | None | Offline-first: no server costs, no keys, no network needed live. |
| Hosting (prototype) | Static `dist/` (expo export) on Netlify/Vercel | Free static hosting; constraint: web-only until EAS APK in Phase 2. |

Offline single-app with no services: the data flow is `data/maya.ts` →
`state/useJar.ts` → three tab screens + sheets.

### Build plan & scope

- **Phase 1 (this submission, frozen):** 3 tabs (Today / Week / Dots), 3 sheets
  (Fix / Split / Logger), scripted 94→71, Undo, toasts, public web link.
- **Explicitly cut:** drag gestures, persistence, notifications, auth, sync,
  backend, Play release, analytics, real jar math — parked with a promotion rule
  (5 hallway users accept Fix first).
- **Phase 2 (3-week building phase):** real jar sum from block weights, learned
  combo receipts from dots, SQLite persistence, EAS Android APK, local
  morning/night reminders. Same UI — no rebuild.

