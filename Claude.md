# MASTER ARCHITECTURAL SPECIFICATION: "I HEARD A RUMOR"
## A Nigerian Investigative Tabloid Strategy Game (Homage to Plague Inc. & Watch Dogs 2)

---

## 0. CORE PHILOSOPHY & DIRECTIVES FOR CLAUDE CODE

### A. Design Homage & Core Loop
This game is a deep, systemic homage to **Plague Inc.** reimagined as an investigative tabloid & rumor-contagion strategy game set in modern Nigeria, paired with a tactile **Watch Dogs 2 / Detective Corkboard** progression tree[cite: 7].
Every core pillar of *Plague Inc.* maps 1:1 into this engine:
1. **Healthy -> Infected -> Dead** === `Unaware -> Heard -> Believers` (with a 4th burnout pool: `Jaded` / "Gist Fatigue").
2. **Infectivity (I)** === `Velocity (V)` — How fast rumors spread within a state and jump across state highways and domestic airports.
3. **Severity (S)** === `Notoriety (N)` — Increases stochastic Spark bubble payouts/frequency, but accelerates State Security `Heat` and triggers Target PR counter-offensives.
4. **Lethality (L)** === `Credibility (C)` + `Hard Evidence` — Converts passive gossipers (`Heard`) into outraged `Believers` while shielding against `Doubt`.
5. **Pathogen Types (Bacteria, Virus, Bio-Weapon)** === **Target Archetypes & Scandal Categories** — Each Target has a unique AI passive modifier, and each Scandal Category (`FINANCIAL`, `AFFAIR`, `LEAKED_MEDIA`, `FAKE_CREDENTIALS`)[cite: 1] activates `1.35x` synergy multipliers and custom flavor texts on matching channels.
6. **Red & Orange DNA Bubbles** === **Dual Spark (⚡) Economy** — Deterministic "First Whisper" sparks on newly infected states + Stochastic RNG sparks scaled by Notoriety.
7. **Blue Cure Bubbles** === **Target AI "PR Spin" Bubbles** — Interactive counter-bubbles spawned on the map during Target PR offensives that the player must tap/shatter before they detonate and spike `Doubt`.
8. **Wealthy / Cold Country Resistance & Island Lockdowns** === **State Demographic Friction Tags** (`GRASSROOTS`, `HYPER_ONLINE`, `ELITE_HUB`) — Bureaucratic strongholds like FCT and Lagos resist street gossip until mainstream `PRESS` and `ELITE` channels are chained.
9. **Genetic Reshuffle (Cure Rollback)** === **The Defense Desk (OpSec Protocols)** — Active countermeasures bought with Sparks to scrub `Heat` and block Target PR moves.

### B. Rules of Execution for Claude Code
1. **PRESERVE EXISTING ASSETS:** Keep all SVG state path geometry in `src/engine/data/nigeriaData.ts`[cite: 9, 10] and preserve all Nigerian cultural flavor text in `src/engine/data/channels.ts` and `src/engine/data/evidence.ts`.
2. **ZERO STUBS OR SHORTCUTS:** Every screen, desk (`CHANNELS`, `EVIDENCE`, `DEFENSE`)[cite: 9, 10], bubble type, visual vector, alert archetype, and endgame state must be 100% implemented and wired.
3. **COMPILER VERIFICATION:** Run `npm run build` (or `npx tsc --noEmit`) after each implementation phase and resolve all TypeScript or import errors immediately.
4. **SAVE KEY VERSIONING:** Use `rumor_game_save_v4` in `saveManager.ts` and provide an accessible "New Investigation / Reset" button so stale saves never break state initialization.

---

## 1. VIEWPORT, PALETTE & TACTILE AESTHETIC
- **Mobile Portrait Frame:** Locked mobile aspect ratio (`w-full max-w-[440px] h-screen mx-auto relative overflow-hidden select-none shadow-2xl`)[cite: 5, 6, 9, 10].
- **Tactile Tabloid & Corkboard Palette:**
  - Aged Newsprint / Corkboard Canvas: `#EFEBE0` and `#F4F1EA`[cite: 4, 7, 9, 10]
  - Brutalist Ink & Borders: `#1A1A1A` with hard offset shadows (`shadow-[4px_4px_0px_#1A1A1A]`)[cite: 1, 7]
  - Tabloid Crimson Accent: `#8B0000` / `#B91C1C`[cite: 7]
  - Clout / Spark Counter Tape: `#FDE68A` / `#FEF3C7` with `#B45309` text and a translucent masking-tape strip on top[cite: 4, 7]
  - Paper Grain Overlay: Subtle SVG `feTurbulence` noise layer (`opacity-[0.04] mix-blend-multiply pointer-events-none`) across paper surfaces.

---

## 2. TARGET ARCHETYPES & SCANDAL LOADOUT (PRE-GAME DOSSIER SCREEN)
Before entering the map on a new run, present a tactile **Classified Case File Screen** where the player selects their Target and Scandal Category. Each Target modifies the simulation rules (like *Plague Inc.* pathogen classes):

1. **Chief Obafemi "The Godfather" Adebayo (Governor / Political Titan)**
   - **Default Scandal Category:** `FINANCIAL` (*The Vanished ₦85B Ecological Fund*)[cite: 1]
   - **AI Passive ("Federal Might"):** `ELITE_HUB` states have `0.25x` spread resistance instead of `0.40x` until `PRESS`/`ELITE` channels are unlocked, and `Heat` rises `15%` faster per tick.
2. **Apostle Miracle "Anointed" Chukwu (Mega-Church Televangelist)**
   - **Default Scandal Category:** `AFFAIR` (*Secret Cyprus Villa & Leaked Entanglement Tapes*)[cite: 1]
   - **AI Passive ("Flock Immunity"):** Baseline `Doubt` starts at `25%` across all states because followers defend him blindly; requires early `LEAKED_MEDIA` or `AFFAIR` synergy nodes[cite: 1] and hard Evidence to break initial skepticism.
3. **Tobi "CryptoKing" Adeyemi (Web3 / FinTech Ponzi Founder)**
   - **Default Scandal Category:** `LEAKED_MEDIA` (*Leaked Voice Note Laughing at Wiped-Out Retail Investors*)[cite: 1]
   - **AI Passive ("Bot Farm War Chest"):** Spawns `PR Spin Bubbles` twice as often in `HYPER_ONLINE` states (Lagos, Rivers, Enugu, Oyo, Abuja), rapidly spiking Doubt if the player doesn't shatter them.
4. **Hon. Musa "Toronto" Danjuma (Federal Minister)**
   - **Default Scandal Category:** `FAKE_CREDENTIALS` (*Forged University Degree & Ghost NYSC Certificate*)[cite: 1]
   - **AI Passive ("Court Injunction Machine"):** Every Target PR Counter-Offensive at 20%, 45%, and 70% Believers simultaneously adds `+10% Heat` via frivolous defamation suits unless countered at the Defense Desk.

*(Allow the player to either use the Target's default Scandal Category or mix-and-match any of the 4 categories: `FINANCIAL`, `AFFAIR`, `LEAKED_MEDIA`, `FAKE_CREDENTIALS`[cite: 1].)*

---

## 3. STRICT PRE-LEAK ONBOARDING SEQUENCE (PHASE 1 HARD LOCK)

1. **Initial Frozen State:**
   - `currentDay = 1` (Out of `20` total days)[cite: 9, 10]
   - `sparks = 0` (Zero starting clout)
   - `heat = 0`[cite: 9, 10]
   - `hasPlantedSeed = false`
   - `hasPoppedFirstSpark = false`
   - `startingStateId = null`
   - `selectedStateId = null` (Defaults bottom inspection bar to `NG NIGERIA` / `POP: 223.8M`)[cite: 9, 10]
2. **Engine Loop Gate:**
   - The 6-second daily tick interval (`6000ms = 1 Day`) is strictly disabled while `!hasPoppedFirstSpark || isPaused || notificationQueue.length > 0 || activeModal !== null`.
3. **Bottom Dock Lock:**
   - While `!hasPoppedFirstSpark`, all 4 bottom dock buttons (`CHANNELS`, `EVIDENCE`, `DEFENSE`, and the `II` Pause button)[cite: 9, 10] are `disabled` with muted styling (`bg-[#D4CFC4] text-slate-500 opacity-60 cursor-not-allowed`).
4. **Step 1 — Tap State to Plant Seed:**
   - Display a floating instruction badge over the map while `!hasPlantedSeed`: `"TAP A STATE TO PLANT THE RUMOR"`[cite: 10].
   - When the player taps any state on the Nigeria SVG map:
     - Set `hasPlantedSeed = true`, `startingStateId = stateId`, and `selectedStateId = stateId`.
     - Highlight that state on the map with a pulsing amber fill (`#FEF3C7`) and border (`#B45309`).
     - Set `states[stateId].heard = 1`, `states[stateId].unaware -= 1`, `states[stateId].hasSpawnedFirstWhisper = true`.
     - Immediately spawn 1 deterministic `SparkBubble` (`id: 'spark_first_' + stateId`, `amount: 15`, `ticksRemaining: 9999`) directly over that state.
5. **Step 2 — Shatter the First Spark Bubble:**
   - The game remains frozen until the player taps that `15 ⚡` spark bubble.
   - Tapping the bubble triggers a **400ms radial 6-shard glass-shatter animation** (bubble snaps to `scale-0` while 6 jagged `#B45309` shards shoot outward at 60° angles).
   - After 400ms: Add `+15 ⚡`, set `hasPoppedFirstSpark = true`, and push the **Ground Zero `STREET_WHISPER` Alert Card** into `notificationQueue` (*"An agbero at a motor park in {State} just overheard a wild rumor about {Target}..."*).
   - When the player dismisses that alert card, the bottom dock (`CHANNELS`, `EVIDENCE`, `DEFENSE`, `II`) unlocks and the 6-second daily clock officially begins ticking.

---

## 4. LIVE MAP HUD, STATE INSPECTION & VISUAL CONTAGION VECTORS

### A. Map Canvas (`src/ui/components/NigeriaMapCanvas.tsx`)
- Supports touch/mouse pan and zoom (`+`, `-`, `■` reset buttons in top-right)[cite: 1, 9, 10].
- **Dynamic State Choropleth Coloring:**
  - `heard === 0 && believers === 0`: Default warm paper (`#F4F1EA`) with `#1A1A1A` borders[cite: 9, 10].
  - `startingStateId`: Amber border (`#B45309`) with subtle pulse early on.
  - As `heard / population` grows: Tint shifts from pale amber (`#FEF3C7`) to warm orange (`#F59E0B`).
  - As `believers / population` grows: Tint shifts from light crimson (`#FECACA`) to deep tabloid blood-red (`#991B1B`) at `>= 60%` Believers.
  - If `jaded / population > 0.25`: Overlay a subtle grey crosshatch or desaturated slate tint indicating Gist Fatigue burnout.
- **Visual Transit Vectors (Plague Inc. Planes & Highways):**
  - Whenever a domestic flight jump occurs between airport hubs (`lagos`, `fct`, `kano`, `rivers`, `enugu`), animate a dashed crimson SVG arc (`stroke="#8B0000"`) with a tiny paper-plane/wireless icon travelling from origin hub to destination hub over 1.5 seconds.
  - Whenever a land border jump infects a brand-new state (`heard` goes from `0` to `>0`), briefly pulse the newly infected state's border in bright amber.

### B. Bottom Dark Inspection Card (`LiveGameScreen.tsx`)
- Tapping a state after `hasPlantedSeed === true` selects that state (`selectedStateId = stateId`) for inspection. Tapping the ocean/background resets `selectedStateId = null` to show `NG NIGERIA` (`POP: 223.8M`)[cite: 9, 10].
- **Displays:**
  - Header: State Name (or `NG NIGERIA`), Demographic Tag badge (`GRASSROOTS`, `HYPER_ONLINE`, or `ELITE HUB`), and Total Population[cite: 9, 10].
  - Stacked Progress Bar: Shows exact proportions of `Believers` (deep red `#DC2626`), `Heard` (amber `#D97706`), `Jaded` (slate `#64748B`), and `Unaware` (dark grey).
  - Sub-stats row: `Heard: X%` | `Believers: Y%` | `Doubt: Z%` | `Fatigue: W%`.
  - Dynamic Street Gist Quote: Changes dynamically based on the state's status:
    - *Unaware:* `"Dead silence. Nobody in this state has heard a single whisper yet."`
    - *Early Heard (<15%):* `"Quiet whispers at bus stops and barbershops. People are asking if it's true..."`
    - *High Doubt (>65%):* `"The streets are calling cap! People think this is a paid political hatchet job without receipts."`
    - *High Jaded (>20%):* `"Gist fatigue has set in. Citizens are tired of hearing talk with no hard evidence."`
    - *High Believers (>50%):* `"Open outrage across the state! Street debates and radio callers are demanding immediate arrest."`

---

## 5. THE CONSPIRACY BOARD SKILL TREE (`src/ui/components/ConspiracyBoard.tsx`)

Scrap all list modals[cite: 1]. The `CHANNELS` button opens a full-screen draggable **Conspiracy Board** combining *Plague Inc.*'s progression dependencies with *Watch Dogs 2* / detective corkboard aesthetics[cite: 7].

### A. Canvas & Lane Architecture
- **Virtual Canvas Size:** `2000px` wide by `1000px` tall inside a touch-draggable viewport with clamped boundaries (`x: [-1600, 100]`, `y: [-500, 100]`).
- **4 Horizontal Branch Lanes:**
  1. `STREET` (`Y = 150`) — Dashed horizontal divider at `Y = 250`[cite: 7]
  2. `SOCIAL` (`Y = 350`) — Dashed horizontal divider at `Y = 450`[cite: 7]
  3. `PRESS` (`Y = 550`) — Dashed horizontal divider at `Y = 650`[cite: 7]
  4. `ELITE` (`Y = 750`)[cite: 7]
- **Taped Row Labels:** Pinned along the left margin (`left: 15px`) with slight `-3deg` / `+2deg` rotations and a translucent tape strip[cite: 7].

### B. Complete 23-Node Coordinate, Prerequisite & Stat Table (`src/engine/data/channels.ts`)
Every channel must have exact manual `(gridX, gridY)` coordinates (NEVER use auto-layout math), `requires` prerequisites, `synergy` tags, and the 3 Master Variables (`velocity`, `credibility`, `notoriety`), while preserving existing flavor texts for `DEFAULT`, `FINANCIAL`, `AFFAIR`, `LEAKED_MEDIA`, and `FAKE_CREDENTIALS`[cite: 1]:

#### 1. STREET LANE (`Y = 150`)
1. `street_agbero` — **"Agbero & Motor Park Loudmouths"**[cite: 2, 4, 6]
   - `cost: 12`[cite: 2, 4] | `requires: []` | `gridX: 150, gridY: 150`
   - `velocity: 0.22, credibility: 0.04, notoriety: 0.06` | `synergy: ['AFFAIR', 'FINANCIAL']`
2. `street_okada` — **"Keke & Okada Union Mudflaps"**[cite: 2, 4, 6]
   - `cost: 18` | `requires: ['street_agbero']` | `gridX: 400, gridY: 150`
   - `velocity: 0.25, credibility: 0.05, notoriety: 0.08` | `synergy: ['LEAKED_MEDIA']`
3. `street_salons` — **"Barber Shop & Hair Salon Gist"**[cite: 2, 4, 6]
   - `cost: 24` | `requires: ['street_okada']` | `gridX: 650, gridY: 150`
   - `velocity: 0.24, credibility: 0.08, notoriety: 0.07` | `synergy: ['AFFAIR', 'LEAKED_MEDIA']`
4. `street_iyaloja` — **"Market Women Association (Iyaloja)"**[cite: 5]
   - `cost: 32` | `requires: ['street_salons']` | `gridX: 900, gridY: 150`
   - `velocity: 0.28, credibility: 0.14, notoriety: 0.12` | `synergy: ['FINANCIAL', 'FAKE_CREDENTIALS']`
5. `street_viewing_center` — **"Viewing Center Halftime Debates"**[cite: 5]
   - `cost: 38` | `requires: ['street_iyaloja']` | `gridX: 1150, gridY: 150`
   - `velocity: 0.30, credibility: 0.12, notoriety: 0.14` | `synergy: ['FINANCIAL', 'LEAKED_MEDIA']`

#### 2. SOCIAL LANE (`Y = 350`, fanned between `270` and `430`)
6. `social_whatsapp` — **"WhatsApp 'Forwarded Many Times'"**[cite: 1, 2, 4, 6]
   - `cost: 15`[cite: 1] | `requires: []` | `gridX: 150, gridY: 350`
   - `velocity: 0.26, credibility: 0.05, notoriety: 0.10` | `synergy: ['FINANCIAL', 'AFFAIR', 'LEAKED_MEDIA', 'FAKE_CREDENTIALS']`
7. `social_deh_geh` — **"Deh Geh — Financial Sense Live"**[cite: 1, 6]
   - `cost: 25`[cite: 1] | `requires: ['social_whatsapp']` | `gridX: 400, gridY: 270`
   - `velocity: 0.28, credibility: 0.14, notoriety: 0.18` | `synergy: ['FINANCIAL', 'AFFAIR']`[cite: 1]
8. `social_baidasoj` — **"BaidaSoj — TikTok Drag Session"**[cite: 1, 2, 6]
   - `cost: 28`[cite: 1, 2] | `requires: ['social_whatsapp']` | `gridX: 400, gridY: 350`
   - `velocity: 0.34, credibility: 0.08, notoriety: 0.22` | `synergy: ['AFFAIR', 'LEAKED_MEDIA']`[cite: 1]
9. `social_mazi_tunde` — **"Mazi Tunde — IG Blog Megaphone"**[cite: 6]
   - `cost: 30` | `requires: ['social_whatsapp']` | `gridX: 400, gridY: 430`
   - `velocity: 0.32, credibility: 0.10, notoriety: 0.24` | `synergy: ['AFFAIR', 'FINANCIAL']`
10. `social_veedarkman` — **"VeeDarkMan — Activist Callout"**[cite: 1, 5]
    - `cost: 35`[cite: 1] | `requires: ['social_deh_geh']` | `gridX: 650, gridY: 270`
    - `velocity: 0.35, credibility: 0.22, notoriety: 0.28` | `synergy: ['FAKE_CREDENTIALS', 'FINANCIAL']`[cite: 1]
11. `social_pellaboy` — **"Pellaboy — Campus TikTok Soundbyte"**[cite: 5, 6]
    - `cost: 32` | `requires: ['social_baidasoj']` | `gridX: 650, gridY: 350`
    - `velocity: 0.36, credibility: 0.09, notoriety: 0.20` | `synergy: ['LEAKED_MEDIA', 'AFFAIR']`
12. `social_vawulence` — **"VawulenceHQ — Meme War Room"**[cite: 5]
    - `cost: 40` | `requires: ['social_veedarkman', 'social_mazi_tunde']` | `gridX: 900, gridY: 310`
    - `velocity: 0.42, credibility: 0.12, notoriety: 0.30` | `synergy: ['FAKE_CREDENTIALS', 'LEAKED_MEDIA']`
13. `social_zazuu_king` — **"Zazuu King — Street Wahala Live"**[cite: 2, 4, 5]
    - `cost: 30`[cite: 2] | `requires: ['social_pellaboy']` | `gridX: 900, gridY: 390`
    - `velocity: 0.38, credibility: 0.10, notoriety: 0.26` | `synergy: ['LEAKED_MEDIA', 'FINANCIAL']`
14. `social_counselor_blee` — **"Counselor Blee — Toxic Relationship Breakdowns"**[cite: 2, 5]
    - `cost: 36` | `requires: ['social_zazuu_king']` | `gridX: 1150, gridY: 350`
    - `velocity: 0.32, credibility: 0.16, notoriety: 0.22` | `synergy: ['AFFAIR']`
15. `social_presido_akpi` — **"Presido Akpi — Late Night IG Live"**[cite: 5]
    - `cost: 45` | `requires: ['social_counselor_blee']` | `gridX: 1400, gridY: 350`
    - `velocity: 0.45, credibility: 0.18, notoriety: 0.35` | `synergy: ['AFFAIR', 'LEAKED_MEDIA']`

#### 3. PRESS LANE (`Y = 550`, cross-chained from Street + Social)
16. `press_dialect_fm` — **"Local Dialect FM Radio Phone-In"**[cite: 2, 4, 6]
    - `cost: 20`[cite: 2, 4] | `requires: ['street_agbero', 'social_whatsapp']` | `gridX: 400, gridY: 550`
    - `velocity: 0.24, credibility: 0.20, notoriety: 0.15` | `synergy: ['FINANCIAL', 'FAKE_CREDENTIALS']`
17. `press_broda_dapo` — **"Broda Dapo — X Fact-Check Quote"**[cite: 2, 4, 5, 6]
    - `cost: 28`[cite: 2, 4] | `requires: ['press_dialect_fm']` | `gridX: 650, gridY: 550`
    - `velocity: 0.22, credibility: 0.28, notoriety: 0.18` | `synergy: ['FAKE_CREDENTIALS', 'FINANCIAL']`
18. `press_front_page` — **"Newspaper Front-Page Lead"**[cite: 5]
    - `cost: 38` | `requires: ['press_broda_dapo']` | `gridX: 900, gridY: 550`
    - `velocity: 0.20, credibility: 0.34, notoriety: 0.25` | `synergy: ['FINANCIAL', 'FAKE_CREDENTIALS']`
19. `press_oga_rufai` — **"Oga Rufai — Morning TV Grill"**[cite: 5]
    - `cost: 45` | `requires: ['press_front_page']` | `gridX: 1150, gridY: 550`
    - `velocity: 0.26, credibility: 0.42, notoriety: 0.32` | `synergy: ['FINANCIAL', 'FAKE_CREDENTIALS']`
20. `press_dr_aproko` — **"Dr. Aproko — Calm Thread Fact-Check"**[cite: 4]
    - `cost: 42` | `requires: ['press_oga_rufai']` | `gridX: 1400, gridY: 510`
    - `velocity: 0.20, credibility: 0.38, notoriety: 0.20` | `synergy: ['FAKE_CREDENTIALS', 'LEAKED_MEDIA']`
21. `press_aunty_kemi` — **"Aunty Kemi — Investigative Substack"**[cite: 5]
    - `cost: 44` | `requires: ['press_oga_rufai']` | `gridX: 1400, gridY: 590`
    - `velocity: 0.22, credibility: 0.40, notoriety: 0.28` | `synergy: ['AFFAIR', 'FINANCIAL', 'FAKE_CREDENTIALS']`
22. `press_international` — **"International Media Syndication"**
    - `cost: 55` | `requires: ['press_aunty_kemi', 'press_front_page']` | `gridX: 1650, gridY: 550`
    - `velocity: 0.30, credibility: 0.50, notoriety: 0.38` | `synergy: ['FINANCIAL', 'FAKE_CREDENTIALS', 'LEAKED_MEDIA']`

#### 4. ELITE LANE (`Y = 750`, cross-chained into Press/Institution)
23. `elite_secretariat` — **"Civil Service Secretariat Tea"**[cite: 4, 5, 6]
    - `cost: 20`[cite: 4, 6] | `requires: []` | `gridX: 150, gridY: 750`
    - `velocity: 0.12, credibility: 0.26, notoriety: 0.16` | `synergy: ['FINANCIAL', 'FAKE_CREDENTIALS']`
24. `elite_pulpit` — **"Juma'at & Sunday Altar Sub-Sermons"**[cite: 4, 6]
    - `cost: 30` | `requires: ['elite_secretariat']` | `gridX: 400, gridY: 750`
    - `velocity: 0.18, credibility: 0.35, notoriety: 0.22` | `synergy: ['AFFAIR', 'FINANCIAL']`
25. `elite_country_club` — **"Ikoyi & Maitama Golf Lounge Leaks"**[cite: 4, 6]
    - `cost: 40` | `requires: ['elite_pulpit', 'press_dialect_fm']` | `gridX: 650, gridY: 750`
    - `velocity: 0.15, credibility: 0.44, notoriety: 0.30` | `synergy: ['FINANCIAL', 'AFFAIR']`
26. `elite_campus_protest` — **"ASUU & Campus Union Ultimatum"**[cite: 4, 5]
    - `cost: 50` | `requires: ['elite_country_club', 'press_front_page']` | `gridX: 900, gridY: 750`
    - `velocity: 0.28, credibility: 0.48, notoriety: 0.36` | `synergy: ['FAKE_CREDENTIALS', 'FINANCIAL']`

*(Note: Keep any existing channel IDs in `CHANNELS_DATA` matched to this exact tree.)*

### C. Node Rendering Rules (Pushpins, Newspaper Icons, Dymo Tape & "Ready" Pulse)
- **Circular Pushpin Nodes (`w-12 h-12 rounded-full`):**
  - Connected by Cubic Bezier SVG paths (`#B91C1C` solid red when acquired; `#D97706` dashed amber when available; `#1A1A1A` 15% opacity dashed when locked)[cite: 7].
  - **Inside Circle:** Newspaper-style SVG line icons (`Megaphone` for STREET, `Smartphone` for SOCIAL, `Newspaper` for PRESS, `Classical Pillar` for ELITE, `Lock` when locked).
  - **Pushpin Top:** Deep red pin (`#B91C1C`) if owned; bright amber pin (`#D97706`) if available & affordable; grey pin (`#CBD5E1`) if available & unaffordable.
  - **"Ready" Pulse:** Available + Affordable nodes pulse with a warm amber glow (`shadow-[0_0_15px_rgba(217,119,6,0.65)] animate-pulse`).
  - **Dymo-Tape Label Below:** Slightly tilted (`rotate-[-2deg]` / `rotate-[2deg]`) black embossed label (`bg-[#1A1A1A] text-[#F4F1EA] font-mono text-[9px] px-1.5 py-0.5 uppercase tracking-tighter`) showing abbreviated name + `{cost} ⚡` tag.
- **Slide-Up Manila Folder Inspector:**
  - Tapping a node opens a bottom dossier panel showing: Full Name, Branch badge, Synergy tags (highlighted in gold if matching the active `scandalCategory`)[cite: 1], stat bars for Velocity / Credibility / Notoriety, the **category-specific flavor text** (`channel.flavorTexts[scandalCategory]?.[0] || channel.flavorTexts.DEFAULT[0]`), and the `"Acquire Channel ({cost} ⚡)"` button[cite: 1].

---

## 6. THE EPIDEMIOLOGICAL SIMULATION ENGINE (`src/engine/simulation.ts`)

Every tick (`1 Day = 6000ms`), execute this exact 6-stage pipeline:

### Stage 1: Master Variables ($V, C, N$) & Scandal Synergy
- Start with base values: `V = 0.20`, `C = 0.05`, `N = 0.05`.
- Sum `velocity`, `credibility`, and `notoriety` across all `unlockedChannels`.
- **Synergy Bonus:** If `channel.synergy.includes(gameState.scandalCategory)`, multiply that channel's `velocity` and `credibility` contribution by `1.35x`.

### Stage 2: Bubble Lifespans & Spin Bubble Detonations
- Decrement `ticksRemaining` on all `activeSparks`. Remove expired sparks.
- Decrement `ticksRemaining` on all `activeSpinBubbles` (Target AI counter-bubbles).
- **Spin Detonation:** If a `SpinBubble` reaches `ticksRemaining <= 0` without being tapped by the player, it detonates: add `+15% Doubt` to its host state and `+4% Doubt` to neighboring states!

### Stage 3: Interstate Highway & Domestic Flight Contagion
- **Land Border Highways (`neighbors` array):** Any state where `(heard + believers) > 2000` or `> 1%` of population rolls each tick (`chance = Math.min(0.85, 0.20 + totalVelocity * 0.30 + streetCount * 0.08)`) to infect adjacent states with `0.2%` of their population.
- **Domestic Flight Corridors (`hasAirport: true` for `lagos`, `fct`, `kano`, `rivers`, `enugu`):** Once an airport hub exceeds `3%` awareness and at least 1 `SOCIAL` or `PRESS` node is unlocked, it rolls (`chance = Math.min(0.75, 0.15 + totalVelocity * 0.25)`) to send a flight seed (`0.3%` population) to other airport hubs and triggers a visual flight arc on the map.

### Stage 4: Intra-State Population Funnel & "Gist Fatigue" (`jaded`)
For each infected state (`heard > 0 || believers > 0`):
1. **Demographic Friction (`demographicTag`):**
   - `GRASSROOTS`: `friction = 0.85 + (streetCount * 0.20)`, `doubtGrowthRate = 1.5`.
   - `HYPER_ONLINE`: `friction = 0.90 + (socialCount * 0.25)`, `doubtGrowthRate = 3.5` (demands receipts fast!).
   - `ELITE_HUB`: If `pressEliteCount < 2`, `friction = 0.40` (`0.25` if Target is Godfather Governor). Once `pressEliteCount >= 2`, `friction = 1.15 + (pressEliteCount * 0.15)`. `doubtGrowthRate = 2.8`.
2. **`Unaware -> Heard` (Velocity):**
   - `susceptibleRatio = Math.max(0.05, unaware / population)`
   - `viralFloor = unaware > 0 ? Math.floor(population * 0.014 * friction * Math.min(1.2, totalVelocity)) : 0`
   - `newHeard = Math.min(unaware, Math.floor(heard * totalVelocity * friction * susceptibleRatio) + viralFloor)`
3. **`Heard -> Believers` (Credibility vs. Doubt):**
   - `doubtShield = Math.max(0, (100 - doubt) / 100)`
   - `convictionFloor = (heard > 100 && doubt < 75) ? Math.floor(heard * 0.045 * doubtShield) : 0`
   - `newBelievers = Math.min(heard, Math.floor(heard * totalCredibility * doubtShield) + convictionFloor)`
4. **Doubt Escalation vs. Credibility Anchor:**
   - `credibilityAnchor = totalCredibility * 3.2`
   - `doubt = Math.min(100, Math.max(0, doubt + Math.max(-1.8, doubtGrowthRate - credibilityAnchor)))`
5. **"Gist Fatigue" Burnout (`Heard -> Jaded`):**
   - If `doubt >= 70%` for `2+` consecutive ticks (`highDoubtTicks >= 2`), `12%` of `heard` converts into `jaded` per tick. `jaded` citizens stop spreading the rumor and cannot become `believers` until hard **Evidence** is leaked.
6. **Deterministic "First Whisper" Spark:**
   - The first tick any state reaches `(heard + believers) > 0` (`!hasSpawnedFirstWhisper`), spawn a guaranteed `8 ⚡` `SparkBubble` (`ticksRemaining: 3`) on that state and set `hasSpawnedFirstWhisper = true`.

### Stage 5: Stochastic Sparks, Heat & Investigation Progress
- **Stochastic Spark Spawns:** If `activeSparks.length < 5`, roll `Math.min(0.65, 0.25 + totalNotoriety * 0.45)` to spawn a fast (`3–5 ⚡`, 2 ticks) or fat (`7–12 ⚡`, 4 ticks) spark on a random infected state.
- **Daily Heat Rise:** `heat += Math.max(1.5, totalNotoriety * 7.5 * defenseHeatMultiplier)`.
- **Investigation Progress:** `investigationProgress = Math.min(100, investigationProgress + 6 + defenseInvestigationBonus)`.

---

## 7. THE EVIDENCE LOCKER & DEFENSE DESK (`EvidenceDesk.tsx` & `DefenseDesk.tsx`)

### A. The Evidence Locker (`EVIDENCE` Button)[cite: 9, 10]
- Displays the live `Investigation Progress` bar (`0% -> 100%`) and two tabs or sections: **Verified Dossier Files** (gated by Investigation %) and **Fabricated Forgeries** (available immediately, high backfire risk).
- **4 Verified Evidence Tiers** (Flavor text dynamically adapts to `scandalCategory`):
  1. **Tier 1 (Requires 25% Investigation | Cost: 10 ⚡):** *Redacted Wire / Call Log Snippet*
     - Effect: `-18% Doubt` nationwide, `+8% Heat`, converts `25%` of `Jaded` back to `Heard`.
  2. **Tier 2 (Requires 50% Investigation | Cost: 18 ⚡):** *Insider Voice Note & Stamped Memo*
     - Effect: `-28% Doubt` nationwide, `+14% Heat`, converts `50%` of `Jaded` to `Heard` and `10%` directly to `Believers`.
  3. **Tier 3 (Requires 75% Investigation | Cost: 28 ⚡):** *Uncensored HD Footage / Forensic Audit*
     - Effect: `-40% Doubt` nationwide, `+20% Heat`, converts `75%` of `Jaded` to `Heard` and `20%` directly to `Believers`.
  4. **Tier 4 (Requires 100% Investigation | Cost: 40 ⚡):** *The Smoking Gun Master File*
     - Effect: `-65% Doubt` nationwide, `+25% Heat`, resurrects `100%` of `Jaded`, and immediately converts `25%` of all `Heard` nationwide into `Believers`.
- **2 Fabricated Evidence Gambles (Requires 0% Investigation):**
  1. *Doctored WhatsApp Receipt* (`Cost: 8 ⚡` | `-22% Doubt` | `+12% Heat`)
  2. *Deepfake Audio Leak* (`Cost: 15 ⚡` | `-35% Doubt` | `+18% Heat`)
  - **Forensic Backfire Check:** When leaking Fabricated Evidence, calculate backfire probability: `baseRisk (0.30) + (avgNationalDoubt > 55 ? 0.35 : 0)`.
    - **If Exposed (Backfire):** Doubt spikes `+20%` nationwide, Heat spikes `+25%`, and the `TARGET_PR` Forensic Debunk alert slams onto the screen!

### B. The Defense Desk (`DEFENSE` Button — OpSec & Anti-Heat)[cite: 9, 10]
Allows the player to spend Sparks to fight back against State Security (`Heat`) and Target AI spin:
1. **Burner SIM & IMEI Scrub** (`Cost: 12 ⚡`, Repeatable up to 3x) — Immediate `-18% Heat`.
2. **Encrypted Proxy & Darknet Relay** (`Cost: 20 ⚡`, One-time) — Immediate `-15% Heat` and permanently reduces daily Notoriety Heat gain by `25%`.
3. **Senior Advocate (SAN) Counter-Injunction** (`Cost: 25 ⚡`, One-time) — Immediate `-20% Heat` and neutralizes all active `SpinBubbles` on the map.
4. **Ministry Whistleblower Retainer** (`Cost: 28 ⚡`, One-time) — Immediate `-15% Heat` and increases Investigation Progress speed from `+6%/day` to `+11%/day`.
5. **Emergency Safehouse Relocation** (`Cost: 40 ⚡`, One-time) — Immediate `-45% Heat` (Emergency panic button when DSS tracking vans are at 90% Heat).

---

## 8. MASTER EVENT QUEUE & 6 PHYSICAL ALERT ARCHETYPES (`AlertCardModal.tsx`)

Maintain `notificationQueue: GameAlert[]` and `triggeredMilestones: string[]`.
Whenever `notificationQueue.length > 0`, pause the game clock and render the top alert as a physical document matching one of **6 Archetypes**:

1. **`STREET_WHISPER` (Torn Notebook Scrap / Lined Paper):**
   - *Triggers:*
     - **Seed Pop (Day 1):** Popping the first spark bubble in `startingStateId`.
     - **Power Hub Breach:** First time `lagos`, `fct`, `kano`, or `rivers` gets infected (`heard > 0`).
     - **Regional Sweep (All 6 Geopolitical Zones):** Whenever 100% of states in a zone (`South-West`, `South-East`, `South-South`, `North-Central`, `North-East`, `North-West`) have `heard + believers > 0`!
2. **`VIRAL_RECEIPT` (WhatsApp / Blog Cutout Card with Green Accent):**
   - *Triggers:*
     - Acquiring any `STREET` or `SOCIAL` channel on the Conspiracy Board (uses the channel's category-matched flavor text!)[cite: 1].
     - Leaking Fabricated Evidence when it succeeds without backfiring.
3. **`BREAKING_FRONT` (Neo-Brutalist Newspaper Front Page with Red Stamp):**
   - *Triggers:*
     - Acquiring any `PRESS` or `ELITE` channel on the Conspiracy Board.
     - Leaking any Genuine Evidence file from the Evidence Locker.
     - **First State Flip:** First time any state reaches `>= 50% Believers`.
     - **Nationwide Critical Mass:** Total national Believers crossing `25%`, `50%`, and `80%`.
     - **Clock Warnings:** `Day 10/20` (Halfway attention-span warning) and `Day 17/20` (72 hours remaining warning).
4. **`TARGET_PR` (Official Double-Bordered Cream Letterhead):**
   - *Triggers:*
     - **High Doubt Stagnation:** National average `Doubt >= 65%` (*"The streets are calling cap! Drop receipts immediately"*).
     - **Target PR Counter-Offensive 1 (20% Believers):** *"Fake News / AI Deepfake Denial"* — Adds `+8% Doubt` nationwide and spawns `2 SpinBubbles`.
     - **Target PR Counter-Offensive 2 (45% Believers):** *"Paid Influencer Counter-Hashtag War Chest"* — Adds `+12% Doubt` nationwide and spawns `3 SpinBubbles`.
     - **Target PR Counter-Offensive 3 (70% Believers):** *"Neck Brace & London Hospital Sympathy Stunt + ₦10B Lawsuit"* — Adds `+15% Heat` and spawns `3 SpinBubbles`.
     - **Forensic Backfire:** When a Fabricated Evidence leak is exposed as fake.
5. **`SECURITY_WIRE` (Pink/Red Carbon-Copy DSS Telex):**
   - *Triggers:*
     - **Heat 40%:** Cybercrime Unit begins logging ISP traffic.
     - **Heat 70%:** Telecom throttling & burner bank account freeze warning.
     - **Heat 90%:** Unmarked Hilux tracking vans outside safehouse (imminent raid warning!).
     - **Defense Activated:** Whenever the player purchases an OpSec upgrade from the Defense Desk.
6. **`INFORMANT_TIP` (Dark Manila Envelope with Redacted Stamp):**
   - *Triggers:*
     - `investigationProgress` crossing `25%`, `50%`, `75%`, and `100%` (notifying the player that a new Evidence Tier is ready in the locker).

**Queue Priority & Anti-Spam Rule:**
- Player-initiated actions (Channel bought, Evidence leaked, Defense bought) push to the front of `notificationQueue` immediately (`priority: 100`).
- Background tick triggers evaluate all newly crossed milestones on that tick, sort untriggered candidates by `priority`, push **only the single highest-priority alert** per tick, and record its ID in `triggeredMilestones`.

---

## 9. ENDGAME RESOLUTION SCREENS (`status: 'WON' | 'LOST_HEAT' | 'LOST_TIME'`)

Evaluate at the end of every tick:
1. **VICTORY (`Believers >= 75%` before Day 20 ends):**
   - Full-screen Tabloid Front Page: **"TARGET DISGRACED! EFCC ARREST & RESIGNATION!"**
   - Displays campaign summary: Target Name, Scandal Category, Days Taken (`X/20`), Final Believers %, Peak Heat %, Channels Syndicated, and Evidence Leaked.
2. **DEFEAT — BUSTED (`Heat >= 100%`):**
   - Full-screen Red DSS Security Report: **"SAFEHOUSE RAIDED! OPERATIVES SEIZE LAPTOPS & BURNER PHONES"**
   - Displays campaign summary + tip on using the Defense Desk earlier.
3. **DEFEAT — FIZZLED OUT (`currentDay > 20` with `Believers < 75%`):**
   - Full-screen Tabloid Front


---

## 10. v2 REVISIONS (supersede the numbers above where they conflict)

These changes were made after bot-play showed the original formulas produced a trivially easy, ~2-minute game
where Doubt, Jaded, Spin bubbles, Evidence tiers 3-4 and Notoriety never mattered. Target session length is
**about 5 minutes**. Every tunable number now lives in `src/engine/balance.ts`.

### A. §9.3 completed: the third defeat screen
**DEFEAT - FIZZLED OUT** (`LOST_TIME`, `currentDay > dayBudget`): full-screen tabloid front page, "RUMOR FIZZLES OUT! {TARGET} SURVIVES THE NEWS CYCLE",
with the standard campaign summary and an editor's note about chaining Press/Elite channels and leaking evidence.

### B. Clock
`dayBudget = 30`, `tickMs = 8000`. Clock warnings fire at 50% (Day 15) and at `dayBudget - 3`. LOST_TIME is `currentDay > 30`.

### C. Core model changes
- **Soft caps:** raw V/C/N still add up (spec Stage 1, incl. the 1.35x synergy), but the engine uses
  `x / (1 + x / cap)` with caps 1.5 / 1.0 / 1.6, so late channels still help but never saturate the game.
- **Doubt has a source:** `growth = tag base (1.0 / 2.4 / 1.8) + hype + coverUp pressure`; `hype` = 0.5 x velocity of owned SOCIAL channels
  (viral reach without receipts breeds skepticism). Anchor = `C_eff x 1.7`. Doubt can fall at most 0.8/day.
- **Heard -> Believers** uses `heard x C_eff x 0.35 x doubtShield` (+3% conviction floor).
- **Contagion is lossier:** highway chance per neighbour = `0.05 + 0.12 V + street bonus` (max 0.45), source needs >2000 reached AND >0.5% of its
  population. Flights use `0.10 + 0.15 V` (max 0.5). Geography and the seed state now matter.
- **Economy:** First Whisper bounty = `4 + 10 x sqrt(pop / 15.4M)` (Lagos > Bayelsa). Stochastic sparks: chance `0.4 + 0.35 N_eff`, up to 6 on the board,
  fast 4-6 (2 ticks) / fat 9-14 (4 ticks). About 17% of income now comes from stochastic sparks, so Notoriety pays off.
- **Heat:** `max(1.0, N_eff x 7 x proxy) x target.heatMult x tier.heat`. **Investigation:** +3.6/day (+3 with the Whistleblower).

### D. New meters
- **Cover-Up (the Target's "cure"):** grows daily by `2.0 x tier x target.coverUpRate x (1 + 1.5 x believerShare) x (1 - 0.45 x C_eff/cap)`.
  Detonated Spin bubbles +3, counter-stories (abilities) add more. Verified evidence reduces it (6/10/16/28), forgeries 4/6; a forgery backfire adds 15.
  **Reaching 100% = `LOST_COVERUP`** ("STORY SPUN! {TARGET} WALKS FREE"). Endgame priority: WON, LOST_HEAT, LOST_COVERUP, LOST_TIME.
  Counter-offensives (§8) now fire on Believers (20/45/70%) OR Cover-Up (30/55/80%). New alerts at Cover-Up 65% and 88%.
- **Story Freshness (0-100):** decays 2/day (floor 15). Channels contribute V and C at `0.55 + 0.45 x freshness`. Refreshed by evidence
  (+20/30/45/70, forgeries +10/15), buying a channel (+8), milestones (flip, critical mass, regional sweep, hub breach) and events.

### E. Target abilities and mods (`data/targetTypes.ts`)
Targets are data, not code. `TargetMods`: heatMult, doubtFlat/doubtAdd, tagDoubt, zoneDoubt, coverUpRate, eliteFriction, spinHubs, spinRate,
counterHeat, forgeryRisk, staleRate. `AbilityDef` kinds fire on a schedule: `INJUNCTION` (freezes an owned channel, optionally one lane),
`DISTRACTION` (-Freshness), `HEAT_SURGE`, `COUNTER_STORY` (+Cover-Up), `BOT_SWARM` (spawns Spin bubbles). The dossier text is generated from this
data (`describeTarget`) so it cannot drift from the engine.
- **Frozen channels** contribute nothing and show red tape on the Conspiracy Board. **SAN Counter-Injunction** now also thaws them and blocks the next 2 injunctions.
  The Darknet Relay halves heat surges.

### F. 50 Targets, 5 tiers (`data/targets/tier1..5.ts`)
10 Targets per tier, each with a personality, 3 scandals in distinct categories (the player picks one), a passive and 1-3 abilities.
Tiers: 1 Neighbourhood Big Men, 2 State Players (Godfather, Televangelist, CryptoKing), 3 National Heavyweights (Hon. Danjuma), 4 Titans, 5 The Untouchables.
All Targets are **fictional archetypes with invented names and invented scandals**; some are loose parodies of types of public figure, never of named real people.
Tier baselines (`BALANCE.tier`): Cover-Up x[0.8, 1.15, 1.7, 2.1, 2.6], Heat x[0.9, 1.05, 1.2, 1.35, 1.5], starting Doubt +[0, 3, 6, 10, 14].
The next task (the difficulty system) should scale these tables.

### G. Events and informant decisions (`engine/events.ts`)
Decision cards (cannot be dismissed, clock stays stopped): blackout (random zone), fuel protests, Detty December, ASUU strike, network outage,
platform ban, celebrity wedding, election season, comedian skit, court adjourns, owambe season, and three INFORMANT_TIP choices (clerk, rival, driver).
One per tick at most, cooldown 4 days, never repeated. Effects use the shared `Effect` engine (`engine/effects.ts`), including timed modifiers
(zone friction, highway multiplier, lane multiplier, spark bounty).

### H. Meta-progression (`engine/profile.ts`, key `rumor_profile_v1`)
Tier 1 is open. Tier N+1 opens after taking down 3 *different* Targets in tier N. Sealed tiers show only identical grey silhouettes, "? ? ?" and a lock, so
a new player cannot identify or be overwhelmed by later Targets. Wins are archived as front pages. "Reset saved game" never erases unlocks;
"Erase progress" does. `?unlock=all` in the URL opens every tier for testing.

### I. Save key
`rumor_game_save_v5` (state shape changed; incompatible saves are discarded, never migrated).

### J. Tooling
`npm run build` type-checks first. `npm run verify` runs 79 spec checks. `npm run simulate` plays full runs with three bot skill levels
(`RUNS`, `TIER`, `VERBOSE`, `BALANCE='{"coverUpBase":2.4}'` env overrides). Current baseline win rates (expert / average bot, tiers 1-5):
100/100/96/90/41% and 93/82/64/35/8%.
---

## 10. V2 EXPANSION: CHESS.COM-STYLE BOT ROSTER, AI PERSONALITIES & META-ECONOMY

### A. Global Player Profile & Meta-Currency (`MetaProfile` in `saveManager.ts`)
Maintain a persistent `MetaProfile` in `localStorage` (`rumor_meta_profile_v1`) separate from the active match save so it never resets when a match ends:
- `envelopes: number` (Global currency: "Brown Envelopes ✉️", starts at `50 ✉️` for new players).
- `targetStars: Record<string, number>` (Maps `targetId` -> `1 | 2 | 3` stars earned).
- `unlockedTargetIds: string[]` (Tier 1 targets + Featured Creators are unlocked by default).
- `unlockedPerks: string[]` (Permanent pre-game loadout perks bought with ✉️).
- `equippedPerkId: string | null` (1 active perk per run).

### B. Earning Stars & Brown Envelopes (✉️) on Victory
When a player wins a match (`status === 'WON'`):
- Calculate Stars (`1 to 3`):
  - `1 Star`: Won the match (`Believers >= 75%` by Day 20).
  - `2 Stars`: Won in `<= 15 Days` AND `peakHeat < 75%`.
  - `3 Stars`: Won in `<= 12 Days` AND `peakHeat < 50%` AND `backfiresCount === 0`.
- Award **Brown Envelopes (✉️)**:
  - First-time win against this Target: `+50 ✉️`
  - Star Improvement bonus: `+15 ✉️` per new star earned
  - Replay win bonus: `+15 ✉️`
- Check Tier Progression: Earning `>= 4 Stars` in a Tier automatically unlocks all Targets in the next Tier, OR a player can click `"Bribe Informant to Unseal Dossier (100 ✉️)"` on any locked Target to unlock them immediately!

### C. Tiered Roster & Creator Spotlight (`src/engine/data/targets.ts`)
Organize the Case File Selection Screen into 5 folder tabs:
1. **`CREATOR_SPOTLIGHT` (★ Featured Personalities — Always Unlocked for Viral Access):**
   - **Lord Lamba "The Cruise Master"** (`PR Rating: 1100` | `LEAKED_MEDIA`) — Temperament: `THE_CRASHOUT`, Defense: `SPIN_DOCTOR`.
   - **Daddy Freeze-Frame "The Tithe Collector"** (`PR Rating: 1450` | `FINANCIAL`) — Temperament: `THE_STOIC`, Defense: `SPIN_DOCTOR`.
2. **`TIER_1_STREET` (PR Rating: 300–750 | 24 Days | 0.75x Doubt & Heat):**
   - **Slay Queen "Soft Life" Amaka** (`PR Rating: 400` | `AFFAIR`)
   - **Chukwudi "Forex Signals" Okafor** (`PR Rating: 680` | `FINANCIAL`)
3. **`TIER_2_HEAVYWEIGHTS` (PR Rating: 800–1350 | 20 Days | 1.0x Doubt & Heat):**
   - **Tobi "CryptoKing" Adeyemi** (`PR Rating: 1050` | `LEAKED_MEDIA`)
   - **Burna-Lite "Afro Bad Boy" Kazeem** (`PR Rating: 1280` | `AFFAIR`)
4. **`TIER_3_SYNDICATE` (PR Rating: 1400–1950 | 18 Days | 1.25x Doubt & Heat | Locked until 4 Stars in Tier 2 or 120 ✉️):**
   - **Apostle Miracle "Anointed" Chukwu** (`PR Rating: 1600` | `AFFAIR`)
   - **Hon. Musa "Toronto" Danjuma** (`PR Rating: 1850` | `FAKE_CREDENTIALS`)
5. **`TIER_4_UNTOUCHABLES` (PR Rating: 2000–2600 | 16 Days | 1.5x Doubt & Heat | Locked until 4 Stars in Tier 3 or 250 ✉️):**
   - **Chief Obafemi "The Godfather" Adebayo** (`PR Rating: 2350` | `FINANCIAL`)

### D. The AI Personality Matrix & Live Polaroid Chatter
Every Target in `targets.ts` includes:
- `aiProfile`:
  - `defenseStyle`: `'SPIN_DOCTOR'` (1.5x SpinBubbles, 0.8x Heat) | `'IRON_FIST'` (1.4x Heat, fewer SpinBubbles) | `'BALANCED'`
  - `temperament`: `'THE_CRASHOUT'` (Triggers an early rant at 15% Believers giving player +10% Velocity but spawning 2 SpinBubbles) | `'THE_STOIC'` (Saves counter-attack for a massive ambush at 55% Believers)
  - `weaknessBranch` & `resistanceBranch`: Multiplies channel effectiveness (`1.25x` vs `0.75x`).
  - `signatureMove`: Custom alert headline, body, and mechanical effect triggered once at `50% Believers`.
- `chatter`: 5 reactive 1-liner strings (`onStart`, `onChannelBought`, `onEvidenceDropped`, `onBackfire`, `onCritical`) displayed in a small pinned **Target Polaroid Speech Bubble** at the top-left of the map HUD for 4 seconds whenever those events occur.

### E. Syndicate Perks Shop (Spend Brown Envelopes ✉️ on the Dossier Screen)
Allow players to spend ✉️ on the Case File screen to unlock & equip 1 pre-game Perk:
1. **Motor Park Union Boss (`75 ✉️`):** First Whisper spark gives `22 ⚡` instead of `15 ⚡`.
2. **Encrypted Burner Rig (`100 ✉️`):** Daily Heat rises `20%` slower.
3. **Inside Secretariat Mole (`125 ✉️`):** Investigation starts at `25%` on Day 1 (Tier 1 Evidence unlocked immediately).
4. **Fact-Check Immunity (`150 ✉️`):** Reduces Fabricated Evidence backfire risk by `50%`.

---

## 11. HOW THE "V2 EXPANSION" (SECOND §10 ABOVE) WAS BLENDED INTO THE CODEBASE

The expansion was **not** implemented verbatim. It was merged with the systems from "§10 v2 REVISIONS" so nothing is duplicated.
Where the two disagree, this section wins.

| Expansion asks for | What exists | Blended result |
|---|---|---|
| 4 tiers + Creator Spotlight, ~2 Targets each | 5 tiers, 50 Targets | All 50 kept. 6 new Targets added (56 total: 12/10/11/11/10 + 2 Spotlight). Godfather moved to Tier 4 and the Apostle to Tier 3 so their design-doc PR Ratings (2350 / 1600) fit their folder. `folder` (display/unlock) is separate from `tier` (mechanics). |
| Per-tier days 24/20/18/16 and Doubt/Heat x0.75-1.5 | One 30-day clock | `BALANCE.tier.days = [36,30,28,26,24]`, `heat = [0.75,1.05,1.2,1.35,1.55]`, `doubtGrowth = [0.75..1.75]`; recalibrated with `npm run simulate`. Each match carries its own `dayBudget`. |
| `aiProfile.defenseStyle` | Scattered `heatMult` / `spinRate` target mods | Style is now the **only** source: SPIN_DOCTOR (Spin x1.5, Heat x0.8), IRON_FIST (Heat x1.4, Spin x0.6). The old per-target mods were removed so nothing stacks. `heatMultiplier()` / `spinMultiplier()` in `selectors.ts` are shared by the sim and the Heat sheet. |
| `temperament` | Counter-offensives at 20/45/70% | THE_CRASHOUT: meltdown at 15% Believers (+10% Velocity for 6 days, 2 Spin). THE_STOIC: skips the 20% and 45% counter-offensives and ambushes at 55% (Doubt +14, Cover-Up +10, Heat +10, 4 Spin). STEADY (default) is unchanged. |
| `weaknessBranch` / `resistanceBranch` | Channel stats | Lane multiplier x1.25 / x0.75 on Velocity and Credibility in `computeMasterVariables`. The Conspiracy Board labels the weak and resisted lanes. |
| `signatureMove` (custom copy per Target) | Each Target already has abilities | The signature move is the Target's **strongest ability at double strength, once, at 50% Believers** (alert stamp "SIGNATURE MOVE // ..."). No duplicate copy to maintain. |
| `chatter` (5 lines per Target) | none | `data/aiProfiles.ts`: per-Target custom `onStart` and `onCritical`; the other three beats come from temperament pools (a Crashout and a Stoic sound different). `PolaroidChatter` shows the line for 4s top-left of the map. `onStart` fires when the Ground Zero card is dismissed; `onCritical` on Heat 90, Cover-Up 88, the meltdown and the ambush. Chatter is transient and never saved. |
| `MetaProfile` in `saveManager.ts` (`rumor_meta_profile_v1`) | `Profile` (wins + archive, `rumor_profile_v1`) | The profile was **extended, not duplicated**: `engine/profile.ts` now holds envelopes, stars, bribes, bought tiers, perks and the archive, under the specified key. The old profile is migrated on first load (each old win becomes 1 star and its envelopes). The match save is `rumor_game_save_v6`. |
| Stars: 15/20 and 12/20 days, Heat < 75 / 50, no backfires | n/a | The day thresholds are **shares of the match's own clock** (75% and 60%), which is exactly the doc's 15/20 and 12/20. `GameState.backfires` counts exposed forgeries. |
| Envelopes: +50 first win, +15 per new star, +15 replay | n/a | Implemented as written. Start balance 50. Rewards are stored on the finished match (`winRewards`) so a win can be claimed only once, even across reloads. |
| Tier unlock at 4 stars, or bribe 100 | "3 distinct wins" rule, silhouettes | 4 stars in the previous tier opens the next. A **bribe unseals one Target** (100 ✉️); a **folder buy-out** opens a whole tier (T2 80, T3 120, T4 250, T5 400). Everything still sealed stays a silhouette with hidden name and rating. |
| 4 perks | n/a | The 4 specified perks plus 2 that fit v2 systems: **Press Club Membership** (Freshness decays 25% slower, 110 ✉️) and **Court Bailiff on the Payroll** (first injunction blocked, 130 ✉️). |
| PR Ratings | n/a | Design-doc ratings are fixed (`SPEC_RATINGS`). All others are **calibrated by `npm run rate`**, which plays every Target with the bots and spreads ratings across each folder's range by measured difficulty. The roster sorts easiest first. |

### Roster facts
- Spotlight (always open): Lord Lambo "The Cruise Master" (1100, Leaked Media, Crashout, Spin Doctor) and Daddy Freeze-Frame "The Tithe Collector" (1450, Financial, Stoic, Spin Doctor).
  Both are deliberate parody names with invented scandals; rename freely in `data/targets/spotlight.ts`.
- Added: Amaka (T1, 400), Chukwudi "Forex Signals" (T1, 680), Burna-Lite (T2, 1280), Madam Abiodun "NGO Queen" (T2).

### Tooling added
`npm run rate` (regenerate PR Ratings), `npm run simulate`, `npm run verify` (132 checks), `npm run build` (type-checks first).


---

## 12. VARIETY, PARODY ROSTER & ROBUSTNESS PASS

Goal: every run should feel different, every beat should feel earned, and nothing should be able to break the game.

### A. Parody layer (`data/parody.ts`)
- Base Targets carry **generic fictional names**. When `USE_PARODY_NAMES` is true, a Target in `PARODY` is re-skinned with a parody name that winks at a famous Nigerian persona (Davi-Dough, Wizz-Kidd, Mercy-Full, DJ Cupcake, Mr. Macaroony, Don Jazzier, Tiwa Savagery, Falsz, Basket-Mouth-Full, Dan-Goat, plus the design-doc creators Lord Lambo, Daddy Freeze-Frame and Burna-Lite). Flip the flag to return to the generic roster.
- **A recognisable name is never paired with a believable accusation.** Parody Targets get comic scandals, comic channel flavor (`PARODY_CHANNEL_LINES`), comic evidence (`PARODY_EVIDENCE`) and a comic win screen ("Cancelled! Apology Video & Indefinite Hiatus!") instead of arrests. A test fails the build if accusatory wording reaches a parody Target.
- **No politicians or officeholders by name.** Offices stay generic ("The President").
- An in-game disclaimer ("Every character is a fictional parody...") shows on the Dossier, Pause menu and parody endings.
- Another test fails the build if any Target carries a known real person's name. (An earlier Tier 5 Target accidentally did; fixed.)
- **Before launch, get legal review.** Nigerian cybercrime law has been used against online satire.

### B. Playstyle variety
- Defense styles: SPIN_DOCTOR, IRON_FIST, **LAWYER_UP** (injunctions +1 day and 15% more often, Heat x0.9), **DISTRACTOR** (distractions x1.3, Spin x0.8, story stales 10% faster), BALANCED.
- Temperaments: THE_CRASHOUT, THE_STOIC, **THE_SHOWMAN** (moves 25% more often, 25% softer), **THE_PARANOID** (genuine evidence +50% Heat, Cover-Up -15%), **THE_SCHEMER** (plants a bait bombshell at 30% Believers: verify it, run it and pay, or bin it), STEADY.
- The 61 Targets are spread across all of them (no style or temperament above 30% of the roster).
- Roster: 61 Targets (13 / 12 / 13 / 11 / 10 plus a 2-creator Spotlight). `npm run rate` regenerates PR Ratings.

### C. Run climates (`data/climates.ts`)
Every case rolls a **news climate**: Clear Skies, Harmattan, Rainy Season, Election Year, Detty December, Fuel Scarcity, Strike Season, Blackout Week, Slow News Cycle, Scandal Season. Each nudges lane strength, land-border spread, Heat, spark value, staleness or Cover-Up. The forecast is shown on the Dossier before you commit, in the HUD chip and in the Case File sheet.

### D. Daily Case (`engine/daily.ts`)
One Target, scandal, climate and **random seed** per calendar day, identical for every player. The pool is the always-open Spotlight and Tier 1, so it never reveals sealed Targets. No perks. Winning pays a once-a-day bonus of +25 envelopes, +5 per streak day up to +30. A "Share result" button copies a Wordle-style emoji card.

### E. Copy and card variants
- `copySeed` (per run; the daily seed on dailies) picks which wording each milestone, event and ending uses, so a run reads consistently but runs differ. 30+ alert keys have 3+ variants each (`data/copy.ts`); 24 events (14 + 10 new) each with an alternate body; 4 Ground Zero openings; win/loss headline and body variants; zone-flavored street gist; 24 tips; 8 taglines.
- Every alert archetype has **3 skins** (18 total) chosen per alert: notebook / napkin / receipt; WhatsApp / Instagram story / social post; The Daily Gist / The Naija Sun / The Lagos Ledger; letterhead / legal notice / press statement (Target counter-moves are tinted by the Target's temperament colour); telex / fax / terminal; envelope / voice note / burner SMS. Entry animations vary too.
- Ids and priorities never change with the variant, only wording and visuals.

### F. Feel
- **Spark kinds:** WHISPER (amber), FAST (small teal), FAT (big gold), and a rare **GOLDEN** jackpot (7% of stochastic sparks, x3 value) with its own look and sound.
- Floating "+N ⚡", combo streaks (cosmetic), screen shake and haptics on heavy hits, confetti, star pop-ins and counting-up envelopes on victory.
- **Sound** (`ui/audio.ts`): zero-asset WebAudio synth, mute toggle persisted, haptics gated on user activation.
- **Mood colours** (`ui/mood.ts`): Heat tints the frame and pulses a red vignette; a stale story desaturates; belief builds a golden glow; frozen channels add an icy edge; the map tints from morning paper to evening amber across the match.

### G. Robustness
- `engine/invariants.ts` defines what a healthy state is. `sanitizeState` repairs loaded saves (clamps numbers, drops unanswerable decision cards, realigns the ability schedule) and discards a save that stays unhealthy.
- An unanswerable decision card is dropped when answered, so a player can never be trapped. Every event offers a free choice (tested).
- `ErrorBoundary` shows a recovery screen instead of a blank page and never touches stars, envelopes or perks.
- **Fuzz test:** 400 random whole games across every Target, thousands of random actions, asserting no crash, all invariants, and that the player can always move on.
- Save key is `rumor_game_save_v8`.

---

## 13. SETTINGS, AUDIO, TUTORIAL, TARGET PACKS & STORY MODE

- **Settings** (`ui/settings.ts`, key `rumor_settings_v1`): master/music/effects/ambience volumes, mute, haptics, reduce motion, screen shake,
  mood overlay, high contrast, text size, hints, **Assist Mode**, progress export/import code. Reachable from the Dossier (⚙) and the Pause menu
  (Resume, Case Log, Settings, How to play, Abandon case).
- **Assist Mode:** each day lasts 1.5x longer (`BALANCE.assistTickMult`); assisted wins cap at 1 star, pay half the envelopes and skip the Daily bonus.
  The match carries `assisted`. Training Cases (`training`) pay nothing.
- **Audio** (`ui/audio.ts`, `ui/music/*`): all synthesised. A 15-track music library (`library.ts`: patterns, chords, layers; `synth.ts`: instruments; `player.ts`: bar-by-bar scheduler, crossfades, offline render; `director.ts`: picks the song and intensity from stage, tier, Heat, Cover-Up, belief, time and climate). Stations (Auto, Afrobeats, Amapiano, Chill, Street) and a jukebox live in Settings. Recorded tracks can be listed in `public/music/index.json`. Older note: SFX, a generative Afrobeat-style music bed with scenes (`dossier` / `live` / `tense` / `silent`),
  and ambient beds chosen by climate (rain, harmattan wind, generator hum, party bass, fuel queue, street). Real recorded tracks can replace the music
  by routing a decoded buffer into `musicBus`.
- **Tutorial** (`ui/components/Tutorial.tsx`, `FieldGuide.tsx`): a 14-step guided Training Case in 4 parts (basics, how it spreads, what fights back, your plan) that teaches Velocity, Credibility, Notoriety, Synergy, state types, Doubt, events and climates; every card has "Learn more" (opens the Field Guide), "Take over" (keep playing the case) and "Skip". A Field Guide glossary is in the pause menu and the Dossier. The old description: (fixed Target and seed) with coach-mark spotlights
  (`data-tour` attributes), steps that wait for the real action, the clock held while a card explains something, plus one-time contextual hints.
- **Target packs** (`engine/data/targetPacks.ts`): Targets are JSON (`TargetDef`), validated and registered at runtime. `public/target-packs/index.json`
  lists published packs; Studio drafts live in the browser. Open `?studio=1` for the **Target Studio** (editor, validation, preview, bot balance test, import/export).
  `kind` is FICTIONAL / PARODY / CREATOR (needs consent record, comic scandals only) / STORY. Built-in ids can never be overwritten.
  This is a file-based content pipeline, not a hosted multi-user backend; a CMS can serve the same JSON later.
- **Story Mode** (`data/story.ts`, `engine/story.ts`, `ui/screens/StoryScreen.tsx`): Season 1 "The Receipts", 9 chapters in 3 acts, 12 invented Targets
  (ex, cheating partner, former bestie, colleague, business partner, boss, in-law, ex-spouse, mentor). Pair chapters let the player choose who it was.
  Each chapter has a motive, three approaches (Receipts Only / Whatever Works / Soft Landing) and a reputation ("integrity") that carries forward and
  changes starting Doubt. Three season endings. Approaches are encoded in `perkId` as `story:<approach>:<band>`. `npm run simulate:story` checks fairness.
- Save key is `rumor_game_save_v9`.

---

## 14. DESKTOP DESIGN, OFFLINE LEADERBOARDS, SHARING, FOUNDER'S MARK, OFFLINE PLAY

- **Two deliberate layouts** (`ui/useLayout.ts`, Settings > Layout: Auto/Mobile/Desktop). Mobile is the portrait frame. Desktop (window at least 1100x620) is a
  situation room: `DesktopLiveScreen` has a labelled instrument header, the Target's case file on the left (their next moves with countdowns), the map or the
  Conspiracy Board in the centre (inspection card under the map), Evidence/Defence/Log docked on the right, a news ticker, and keys (1 map, 2 board, E, D, L,
  Space, Esc). Desks reuse the same components with `docked`. The Dossier becomes three panes (your desk, roster grid, case file). Story and Leaderboards are
  centred reading columns. Sheets become centred dialogs (`desk-wrap`/`desk-sheet` CSS). The clock rule is identical on both layouts: while you work at a desk the
  clock waits. Shared live logic is in `ui/live/shared.tsx`.
- **Offline leaderboards** (`engine/scores.ts`, `ui/screens/BoardsScreen.tsx`): no server. A score is a signed code or link (`?s=`); a board code carries up to 25
  scores. Opening a link or pasting a code adds scores locally. Boards: Today, This week, All-time, Crews (average of a crew's best five), Challenges. Name and
  crew are set on the Leaderboards screen. Signatures stop casual edits only; `ScoreStore` is the seam where a server can plug in later.
- **Challenges** (`?c=`): the code holds Target, scandal, climate and seed. Every match is now seeded, so any win can be challenged. Challenge matches have no perks.
- **Share**: `ui/shareCard.ts` draws a 1080x1350 front page on a canvas and shares it with the Web Share API (download fallback).
- **Founder's mark** (`ui/egg.ts`): found, never shown. Paths: secret phrase in Settings > Redeem a code (only a salted SHA-256 is in the source; change it with
  `npm run egg:hash -- "NEW PHRASE"`), the Konami keys, 12 title taps in 8 seconds, a 1-in-300 fax on day 3, a cryptic console note. First find pays 100 envelopes.
  `CREDITS_PUBLIC` or `REVEAL_ON` make the credits public. `LICENSE`, `<meta name="author">` and package.json carry the copyright.
- **Offline play**: `public/sw.js` + `manifest.webmanifest` + icons. After one visit the game opens and plays with no data, and can be installed to the home screen.
- Safety: the clock pauses when the page is hidden; audio suspends; Escape closes layers or pauses; reloading mid-case resumes paused.

## 15. PREMIUM, REMINDERS AND LAUNCH

- **Gist Pass** (`engine/premium.ts`, `ui/components/PremiumSheet.tsx`, `src/config.ts`): "coming soon" with a waitlist until `VITE_MONETIZATION_LIVE=true`. Licences are
  ECDSA-signed codes checked offline with a public key; issue them with `node scripts/licenseTool.mjs issue` (private key in `private/`, never shipped). Premium unlocks
  every Target file, the gold share card and a supporter badge. Licence codes work in Settings > Redeem a code too.
- **Reminders** (`ui/notify.ts`): OneSignal web push, opt-in only, loaded only after opt-in, its worker in the `/push/` scope. Off ("coming soon") until `VITE_ONESIGNAL_APP_ID`.
  Tags streak / daily_done / last_played for segmentation; app-icon badge while the Daily Case is waiting.
- **Launch guide**: `docs/LAUNCH.md` (hosting, env vars, Studio lock, reminders, payments, checklist). `public/_headers`, `privacy.html`, `terms.html` (templates).
