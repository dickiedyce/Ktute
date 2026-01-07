# Ktute - Keyboard Typing Tutor

## Project Overview

A keyboard-driven typing tutor website that supports custom split/ortholinear keyboards and alternative layouts. The entire UI is navigable via keyboard.

## Tech Stack

- **Language**: Vanilla JavaScript (ES6+ modules)
- **Styling**: Plain CSS (CSS custom properties for theming)
- **Build**: Vite (for dev server and bundling only)
- **Package Manager**: Yarn
- **Storage**: LocalStorage for persistence
- **Rendering**: SVG for keyboard visualization
- **Testing**: Vitest for unit tests
- **Version Control**: Git with TDD workflow

## Development Workflow

**Strict TDD: Red-Green-Commit-Refactor-Commit**

1. **Red**: Write a failing test first
2. **Green**: Write minimal code to make the test pass
3. **Commit**: Commit with message describing the feature/fix
4. **Refactor**: Clean up code while keeping tests green
5. **Commit**: Commit the refactor separately

Every feature must follow this cycle. No code without a test first.

## Core Principles

1. **Keyboard-First**: Every interaction must be accessible via keyboard. Mouse is optional.
2. **Zero Dependencies**: No runtime dependencies. Vanilla JS only.
3. **Offline-Ready**: Works without network after initial load.
4. **Layout Agnostic**: Support any keyboard physical layout and any key mapping.

---

## Architecture

```
src/
├── index.html
├── main.js                 # App entry point
├── styles/
│   ├── main.css            # Root styles, CSS variables
│   ├── keyboard.css        # Keyboard visualization
│   ├── practice.css        # Practice mode styles
│   └── components.css      # Reusable component styles
├── core/
│   ├── router.js           # Simple hash-based router
│   ├── state.js            # Global state management
│   ├── storage.js          # LocalStorage/IndexedDB wrapper
│   └── events.js           # Global keyboard event handling
├── keyboard/
│   ├── layout-parser.js    # Parse text-based layout definitions
│   ├── physical-layouts.js # Physical keyboard definitions (Corne, Sweep, etc.)
│   ├── key-mappings.js     # Logical layouts (QWERTY, Colemak-DH, Workman, etc.)
│   ├── renderer.js         # SVG keyboard renderer
│   └── finger-map.js       # Which finger presses which key
├── engine/
│   ├── typing-engine.js    # Core typing logic, character matching
│   ├── word-generator.js   # Generate practice words/text
│   ├── lesson-system.js    # Progressive lesson structure
│   └── statistics.js       # WPM, accuracy, per-key stats
├── views/
│   ├── home.js             # Landing/menu view
│   ├── practice.js         # Main practice view
│   ├── lessons.js          # Structured lessons view
│   ├── layout-editor.js    # Custom layout definition view
│   ├── statistics.js       # Stats dashboard view
│   └── settings.js         # Settings view
└── utils/
    ├── dom.js              # DOM helper utilities
    └── timing.js           # Timing utilities for WPM calculation
```

---

## Layout Definition System

### Physical Layout Format

Users define physical keyboard layout using a simple text format:

```
# Corne (3x6 + 3 thumb keys per side)
[physical:corne]
rows: 3
columns: 6,6
thumb: 3,3
split: true
stagger: none

# Row definitions (0 = no key, 1 = key present)
row0: 1 1 1 1 1 1 | 1 1 1 1 1 1
row1: 1 1 1 1 1 1 | 1 1 1 1 1 1
row2: 1 1 1 1 1 1 | 1 1 1 1 1 1
thumb: 1 1 1 | 1 1 1
```

### Key Mapping Format

Logical layout mapped to physical positions:

```
[mapping:colemak-dh]
base: corne

# Layer 0 (base)
row0: q w f p b | j l u y ;
row1: a r s t g | m n e i o
row2: z x c d v | k h , . /
thumb: esc spc tab | ent bspc del

# Finger assignments (1-4 left pinky to index, 5-8 right index to pinky)
fingers:
row0: 1 2 3 4 4 | 5 5 6 7 8
row1: 1 2 3 4 4 | 5 5 6 7 8
row2: 1 2 3 4 4 | 5 5 6 7 8
thumb: 4 4 4 | 5 5 5
```

---

## Keyboard Navigation System

### Global Keys

| Key | Action |
|-----|--------|
| `Escape` | Back / Cancel / Exit current mode |
| `?` | Show keyboard shortcuts help |
| `1-9` | Quick menu selection |
| `Tab` / `Shift+Tab` | Navigate between focusable elements |
| `Enter` | Confirm / Select |

### View-Specific Keys

**Home View:**
- `p` - Start practice
- `l` - Lessons
- `e` - Layout editor
- `s` - Statistics
- `,` - Settings

**Practice View:**
- `Escape` - Pause / Exit
- `Tab` - Skip word (penalty)
- `Ctrl+Backspace` - Restart current session

**Layout Editor:**
- `Ctrl+S` - Save layout
- `Ctrl+N` - New layout
- Arrow keys - Navigate grid

---

## Data Models

### UserProfile
```javascript
{
  id: string,
  activePhysicalLayout: string,  // e.g., "corne"
  activeKeyMapping: string,      // e.g., "colemak-dh"
  customLayouts: [...],
  customMappings: [...],
  preferences: {
    theme: "dark" | "light",
    showHints: boolean,
    showFingers: boolean,
    soundEnabled: boolean
  }
}
```

### Session
```javascript
{
  id: string,
  timestamp: number,
  duration: number,           // milliseconds
  layoutUsed: string,
  mappingUsed: string,
  mode: "practice" | "lesson",
  lessonId: string | null,
  words: [{
    target: string,
    typed: string,
    startTime: number,
    endTime: number,
    errors: [{ position: number, typed: string, expected: string }]
  }],
  summary: {
    wpm: number,
    rawWpm: number,
    accuracy: number,
    totalChars: number,
    errorChars: number
  }
}
```

### KeyStatistics
```javascript
{
  key: string,
  finger: number,
  totalPresses: number,
  errors: number,
  averageTime: number,    // ms between previous key and this key
  confusedWith: { [key: string]: number }  // common mistypes
}
```

---

## Practice Modes

1. **Free Practice**: Random common words, no progression
2. **Lessons**: Progressive introduction of keys
   - Lesson 1: Home row only
   - Lesson 2: Add top row
   - Lesson 3: Add bottom row
   - etc.
3. **Problem Keys**: Focus on keys with high error rate
4. **Custom Text**: Paste your own text to practice

---

## Statistics Tracked

- **Per Session**: WPM, accuracy, duration, error breakdown
- **Per Key**: Error rate, speed, common mistakes
- **Per Finger**: Load distribution, speed comparison
- **Trends**: Graphs over time (daily/weekly/monthly)

---

## Built-in Physical Layouts

1. Standard 60% / TKL / Full
2. Corne (3x6 + 3)
3. Sweep/Ferris (3x5 + 2)
4. Lily58 (4x6 + 4)
5. Kyria (3x6 + 5)
6. Planck (4x12 ortholinear)

---

## Built-in Key Mappings

1. QWERTY
2. Colemak
3. Colemak-DH
4. Workman
5. Dvorak
6. MTGAP
7. Custom (user-defined)

---

## Development Phases

### Phase 1: Foundation
- [ ] Project setup (Vite, folder structure)
- [ ] Core utilities (DOM helpers, state, storage)
- [ ] Router and view system
- [ ] Global keyboard event handling
- [ ] Basic CSS framework and theming

### Phase 2: Keyboard System
- [ ] Physical layout parser
- [ ] Key mapping parser
- [ ] SVG keyboard renderer
- [ ] Built-in layouts (start with Corne + QWERTY/Colemak-DH)
- [ ] Finger assignment visualization

### Phase 3: Typing Engine
- [ ] Character-by-character matching
- [ ] Word boundary handling
- [ ] Error tracking
- [ ] WPM/accuracy calculation in real-time
- [ ] Session management

### Phase 4: Practice Views
- [ ] Practice mode UI
- [ ] Real-time feedback (correct/incorrect highlighting)
- [ ] Current/next word display
- [ ] On-screen keyboard with finger hints
- [ ] Session summary screen

### Phase 5: Lessons & Progression
- [ ] Lesson definitions
- [ ] Progress tracking
- [ ] Adaptive difficulty
- [ ] Problem key identification

### Phase 6: Statistics Dashboard
- [ ] Session history
- [ ] Per-key stats visualization
- [ ] Trend graphs (simple canvas or SVG charts)
- [ ] Export data

### Phase 7: Layout Editor
- [ ] Visual grid editor for physical layout
- [ ] Key mapping assignment UI
- [ ] Import/export layouts as text
- [ ] Validation

### Phase 8: Polish
- [ ] Themes (dark/light)
- [ ] Animations and transitions
- [ ] Sound feedback (optional)
- [ ] PWA support for offline use
- [ ] Accessibility review

---

## File Naming Conventions

- All lowercase with hyphens: `layout-parser.js`
- Views end with view name: `home.js`, `practice.js`
- CSS mirrors JS structure where applicable

## Code Style

- ES6 modules (`import`/`export`)
- No classes unless genuinely needed; prefer functions and closures
- State is explicit, no hidden globals
- Comments explain "why", not "what"
- JSDoc for public functions

---

## Commands

```bash
# Install dependencies (Vite only)
yarn install

# Development server
yarn dev

# Production build
yarn build

# Preview production build
yarn preview
```

---

## Open Questions

1. Should lessons adapt based on error patterns, or follow a fixed curriculum?
2. How granular should finger mapping customization be?
3. Include n-gram analysis (common letter pairs)?
4. Support for multiple layers (like QMK)? Or base layer only?
