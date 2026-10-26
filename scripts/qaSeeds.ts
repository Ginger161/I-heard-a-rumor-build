// QA SEEDS: realistic saved games and profiles, so the QA runner (scripts/qa.mjs) can open any screen in any state without playing there.
//   npx esbuild scripts/qaSeeds.ts --bundle --platform=node --format=cjs --outfile=node_modules/.cache/qaSeeds.cjs && node node_modules/.cache/qaSeeds.cjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { Actions } from '../src/engine/actions';
import { SaveManager } from '../src/engine/saveManager';
import { saveProfile, emptyProfile } from '../src/engine/profile';
import { emptyStory, perkIdFor } from '../src/engine/story';
import { TEMPLATES, updateArena } from '../src/engine/arena';
import '../src/engine/data/story';
import type { GameAlert, GameState } from '../src/engine/types';
import '../src/engine/data/campaigns';
import { AlertFactory } from '../src/engine/alerts';
import { EVIDENCE_DATA } from '../src/engine/data/evidence';
import { DEFENSE_DATA } from '../src/engine/data/defense';
import { getTarget } from '../src/engine/data/targets';

// A tiny storage so the engine's own save functions produce exactly what the browser would hold.
const store: Record<string, string> = {};
(globalThis as any).localStorage = { getItem: (k: string) => store[k] ?? null, setItem: (k: string, v: string) => { store[k] = v; }, removeItem: (k: string) => { delete store[k]; } };
const flush = (name: string) => { writeFileSync(`scratch/qa/seed_${name}.json`, JSON.stringify({ rumor_board_tour: '1', rumor_howto_seen: '1', ...store, rumor_settings_v1: JSON.stringify({ tutorialDone: true, hints: true, seenHints: ['spin', 'golden', 'decision', 'evidence', 'heat', 'frozen', 'jaded', 'stale', 'coverup'] }) })); Object.keys(store).forEach(k => delete store[k]); };
mkdirSync('scratch/qa', { recursive: true });

const SPREAD: Record<string, number> = { lagos: 0.6, ogun: 0.4, oyo: 0.35, fct: 0.28, kano: 0.22, rivers: 0.3, delta: 0.25, edo: 0.2, enugu: 0.16, osun: 0.3, kaduna: 0.12, plateau: 0.08 };
const mid = (s: GameState, over: Record<string, unknown> = {}): GameState => ({
  ...s, hasPoppedFirstSpark: true, currentDay: 9, isPaused: true, sparks: 44, heat: 24, peakHeat: 24, coverUp: 21, investigationProgress: 32, freshness: 70,
  unlockedChannels: ['street_agbero', 'street_okada', 'social_whatsapp', 'press_dialect_fm'],
  states: Object.fromEntries(Object.entries(s.states).map(([k, v]: any) => [k, SPREAD[k] ? { ...v, believers: Math.floor(v.population * SPREAD[k] * 0.55), heard: Math.floor(v.population * SPREAD[k]) - Math.floor(v.population * SPREAD[k] * 0.55), unaware: v.population - Math.floor(v.population * SPREAD[k]), doubt: 18 + Math.round(SPREAD[k] * 60) } : v])),
  ...over
}) as GameState;

const arcade = () => mid(Actions.plantSeed(Actions.startMatch('owambe_dj', 'LEAKED_MEDIA', null, 'HARMATTAN'), 'lagos'), {
  activeSparks: [
    { id: 'qa_s1', kind: 'FAST', stateId: 'oyo', amount: 5, offsetX: 6, offsetY: -8, ticksRemaining: 2 },
    { id: 'qa_s2', kind: 'FAT', stateId: 'rivers', amount: 12, offsetX: -8, offsetY: 6, ticksRemaining: 3 },
    { id: 'qa_s3', kind: 'GOLDEN', stateId: 'fct', amount: 33, offsetX: 4, offsetY: 8, ticksRemaining: 2 }
  ],
  activeSpinBubbles: [{ id: 'qa_p1', stateId: 'delta', offsetX: 4, offsetY: 0, ticksRemaining: 3, doubtPenalty: 12 }, { id: 'qa_p2', stateId: 'edo', offsetX: -4, offsetY: 4, ticksRemaining: 2, doubtPenalty: 12 }]
});

// 1. an ordinary Arcade match in progress
SaveManager.save(arcade()); flush('arcade_mid');
// 2. its two endings
SaveManager.save({ ...arcade(), status: 'WON', currentDay: 17, winRewards: null } as GameState); flush('arcade_win');
SaveManager.save({ ...arcade(), status: 'LOST_HEAT', heat: 100, currentDay: 14 } as GameState); flush('arcade_lose_heat');
SaveManager.save({ ...arcade(), status: 'LOST_COVERUP', coverUp: 100 } as GameState); flush('arcade_lose_cover');
// 3. a Story match (chapter 1) and an Arena match
SaveManager.save(mid(Actions.plantSeed(Actions.startMatch('story_ex_boyfriend', 'FINANCIAL', null, 'DETTY_DECEMBER', { storyId: 'c01' }), 'lagos'))); flush('story_mid');
const def = TEMPLATES[0].make('Tester');
updateArena(a => ({ ...a, mine: [{ def, check: { rating: 1180, difficulty: 22, best: 90, breadth: 50, tier: 2, verdict: 'ok', bestPlan: 'proof', tips: ['Build Press channels first.'], at: 1 }, published: true, createdAt: 1, updatedAt: 1 }, { def: { ...TEMPLATES[1].make('Tester'), id: 'a_draft1' }, published: false, createdAt: 2, updatedAt: 2 }], shelf: [{ def: { ...TEMPLATES[2].make('Friend'), id: 's_friend1' }, check: { rating: 1620, difficulty: 31, best: 80, breadth: 40, tier: 3, verdict: 'ok', bestPlan: 'quiet', tips: ['Stay quiet.', 'Their weak lane is press.'], at: 1 }, published: true, createdAt: 3, updatedAt: 3 }], results: { s_friend1: { plays: 3, wins: 1, bestDay: 19, rewarded: true } } }));
SaveManager.save(mid(Actions.plantSeed(Actions.startMatch(def.id, def.scandals[0].category, null, 'CLEAR_SKIES'), 'oyo'))); flush('arena_mid');
// the Arena hub with entries (no match)
updateArena(a => ({ ...a, mine: [{ def, check: { rating: 1180, difficulty: 22, best: 90, breadth: 50, tier: 2, verdict: 'ok', bestPlan: 'proof', tips: ['Build Press channels first.', 'Their weak lane is social.'], at: 1 }, published: true, createdAt: 1, updatedAt: 1 }, { def: { ...TEMPLATES[1].make('Tester'), id: 'a_draft1' }, published: false, createdAt: 2, updatedAt: 2 }], shelf: [{ def: { ...TEMPLATES[2].make('Friend'), id: 's_friend1' }, check: { rating: 1620, difficulty: 31, best: 80, breadth: 40, tier: 3, verdict: 'ok', bestPlan: 'quiet', tips: ['Stay quiet.'], at: 1 }, published: true, createdAt: 3, updatedAt: 3 }], results: { s_friend1: { plays: 3, wins: 1, bestDay: 19, rewarded: true } } }));
flush('arena_hub');
// 4. Story progress: chapter 1 and 2 won, some clues, a few flags
const prof = { ...emptyProfile(), envelopes: 120, story: { ...emptyStory(), prologueSeen: true, trust: 7, coker: 3, flags: ['told_hrp', 'phone_taken'], clues: ['C01', 'C02', 'C03'], choices: { c01_hrp: 'truth' }, scenesSeen: ['prologue', 'c01.pre', 'c01.won', 'c02.pre', 'c02.won'], results: { c01: { won: true, stars: 2, approach: 'truth' as const, backfires: 0, day: 18, targetId: 'story_ex_boyfriend', attempts: 1 }, c02: { won: true, stars: 3, approach: 'whatever' as const, backfires: 1, day: 16, targetId: 'story_cheating_girlfriend', attempts: 2 } }, picks: { c01: 'story_ex_boyfriend', c02: 'story_cheating_girlfriend' }, integrity: 2 } };
saveProfile(prof as any); flush('story_hub');
// 5. Arcade profile with progress (stars, an archive entry) for the Dossier
saveProfile({ ...emptyProfile(), envelopes: 215, targetStars: { slay_queen: 3, skit_king: 2, owambe_dj: 1 }, archive: [{ targetId: 'slay_queen', targetName: 'Slay Queen "Soft Life" Amaka', scandalTitle: 'A "Sponsor" Who Turns Out to Be a Married Senator', day: 14, believers: 78, stars: 3, finishedAt: 1 }] } as any); flush('dossier_progress');
// 6. alert cards: every archetype in every skin
const ARCH: GameAlert['archetype'][] = ['STREET_WHISPER', 'VIRAL_RECEIPT', 'BREAKING_FRONT', 'TARGET_PR', 'SECURITY_WIRE', 'INFORMANT_TIP'];
const hash = (s: string) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
const base = arcade();
ARCH.forEach(arch => {
  const found = new Set<number>();
  for (let k = 0; k < 60 && found.size < 3; k++) {
    const id = `qa_${arch}_${k}`; const skin = hash(`${id}:${base.copySeed}`) % 3;
    if (found.has(skin)) continue; found.add(skin);
    const alert: GameAlert = { id, archetype: arch, stampText: arch.replace('_', ' '), headline: 'A Headline That Is Long Enough To Wrap Over Two Lines', body: '"An agbaro at a motor park just overheard a wild rumour about the Target. By tonight half of Lagos will have heard it, and the other half will pretend they did not."', subtext: '+12% Doubt • Spin bubbles: shatter them!', buttonText: 'Fight Back', priority: 79 };
    SaveManager.save({ ...base, isPaused: false, notificationQueue: [alert] } as GameState); flush(`alert_${arch}_${skin}`);
  }
});
// the same cards inside a Story match and an Arena match (they sit on different page colours)
const storyBase = mid(Actions.plantSeed(Actions.startMatch('story_ex_boyfriend', 'FINANCIAL', null, 'DETTY_DECEMBER', { storyId: 'c01' }), 'lagos'));
const arenaBase = mid(Actions.plantSeed(Actions.startMatch(def.id, def.scandals[0].category, null, 'CLEAR_SKIES'), 'oyo'));
([['story', storyBase], ['arena', arenaBase]] as const).forEach(([mode, bs]) => (['STREET_WHISPER', 'TARGET_PR', 'SECURITY_WIRE', 'INFORMANT_TIP'] as GameAlert['archetype'][]).forEach(arch => {
  const found = new Set<number>();
  for (let k = 0; k < 60 && found.size < 3; k++) {
    const id = `qa_${mode}_${arch}_${k}`; const skin = hash(`${id}:${bs.copySeed}`) % 3;
    if (found.has(skin)) continue; found.add(skin);
    const alert: GameAlert = { id, archetype: arch, stampText: arch.replace('_', ' '), headline: 'A Headline That Is Long Enough To Wrap Over Two Lines', body: '"An agbaro at a motor park just overheard a wild rumour about the Target."', subtext: '+12% Doubt', buttonText: 'Fight Back', priority: 79 };
    SaveManager.save({ ...bs, isPaused: false, notificationQueue: [alert] } as GameState); flush(`alert_${mode}_${arch}_${skin}`);
  }
}));
// 7. the guided first case at the moments each lesson fires
const train = () => Actions.plantSeed(Actions.startMatch('slay_queen', 'AFFAIR', null, 'CLEAR_SKIES', { seed: 7, training: true }), 'kano');
const tut = (over: Record<string, unknown>, done: string[]) => { store['rumor_tour_progress'] = JSON.stringify(done); SaveManager.save({ ...train(), hasPoppedFirstSpark: true, isPaused: false, sparks: 30, currentDay: 6, unlockedChannels: ['street_agbero'], ...over } as GameState); };
tut({ heat: 14, peakHeat: 14 }, ['plant', 'spark', 'goal', 'channels', 'spread']); flush('tut_heat');
tut({ heat: 16, peakHeat: 16 }, ['plant', 'spark', 'goal', 'channels', 'spread', 'heat']); flush('tut_defend');
tut({ investigationProgress: 30, heat: 4, peakHeat: 16 }, ['plant', 'spark', 'goal', 'channels', 'spread', 'heat', 'defend']); flush('tut_evidence');
tut({ sparks: 5 }, ['plant', 'spark']); flush('tut_goal');
// 8. the finale: chapters 1 to 15 won, the allies earned, and a won match for chapter 16 waiting on its epilogue
{
  const results: Record<string, any> = {};
  for (let i = 1; i <= 15; i++) results[`c${String(i).padStart(2, '0')}`] = { won: true, stars: 2, approach: 'truth', backfires: 0, day: 14, targetId: i === 1 ? 'story_ex_boyfriend' : i === 2 ? 'story_cheating_girlfriend' : i === 10 ? 'story_ex_husband' : 'x', attempts: 1 };
  const flags = ['told_hrp', 'fola_protected', 'fola_out', 'ngozi_saved', 'ally_coker', 'ally_zainab', 'biko_forgiven', 'zainab_contact'];
  const clues = Array.from({ length: 22 }, (_, i) => `C${String(i + 1).padStart(2, '0')}`);
  const storyP = { ...emptyStory(), prologueSeen: true, trust: 9, coker: 2, flags, clues, results, scenesSeen: ['prologue', 'c16.pre'], integrity: 4 };
  saveProfile({ ...emptyProfile(), envelopes: 300, story: storyP } as any); flush('story_finale_hub');
  saveProfile({ ...emptyProfile(), envelopes: 300, story: storyP } as any);
  const m = Actions.startMatch('story_mentor', 'FAKE_CREDENTIALS', perkIdFor(storyP as any, 'truth'), 'SCANDAL_SEASON', { storyId: 'c16' });
  SaveManager.save({ ...m, status: 'WON', currentDay: 18, isPaused: true, hasPlantedSeed: true, hasPoppedFirstSpark: true, copySeed: 777, winRewards: { stars: 2, previousStars: 0, newStars: 2, breakdown: [], total: 0, envelopesAfter: 300 } } as GameState); flush('story_finale_won');
  const noOracle = { ...storyP, trust: 4, flags: ['told_hrp', 'went_alone', 'biko_used'] };
  saveProfile({ ...emptyProfile(), envelopes: 300, story: noOracle } as any);
  SaveManager.save({ ...m, status: 'WON', currentDay: 18, isPaused: true, hasPlantedSeed: true, hasPoppedFirstSpark: true, copySeed: 778, winRewards: { stars: 2, previousStars: 0, newStars: 2, breakdown: [], total: 0, envelopesAfter: 300 } } as GameState); flush('story_finale_won_basic');
}
// 9. campaigns: the hub with some stars, a match in progress, both endings, and the alert cards in the campaign voice
{
  saveProfile({ ...emptyProfile(), envelopes: 180, targetStars: { camp_handwash: 3, camp_gutters: 2, camp_zobo: 1 } } as any); flush('campaign_hub');
  const cm = () => mid(Actions.plantSeed(Actions.startMatch('camp_nets', 'AFFAIR', null, 'RAINY_SEASON'), 'lagos'), {
    activeSparks: [{ id: 'qa_c1', kind: 'FAST', stateId: 'oyo', amount: 5, offsetX: 6, offsetY: -8, ticksRemaining: 2 }, { id: 'qa_c2', kind: 'FAT', stateId: 'rivers', amount: 12, offsetX: -8, offsetY: 6, ticksRemaining: 3 }],
    activeSpinBubbles: [{ id: 'qa_cp1', stateId: 'delta', offsetX: 4, offsetY: 0, ticksRemaining: 3, doubtPenalty: 12 }], investigationProgress: 52, heat: 31, peakHeat: 31, coverUp: 38
  });
  SaveManager.save(cm()); flush('campaign_mid');
  const rw = { stars: 2, previousStars: 0, newStars: 2, breakdown: [{ label: 'First campaign win', amount: 50 }, { label: '2 new stars', amount: 30 }], total: 80, envelopesAfter: 260 };
  SaveManager.save({ ...cm(), status: 'WON', currentDay: 17, winRewards: rw } as GameState); flush('campaign_win');
  SaveManager.save({ ...cm(), status: 'LOST_COVERUP', coverUp: 100, currentDay: 15 } as GameState); flush('campaign_lose_cover');
  SaveManager.save({ ...cm(), status: 'LOST_HEAT', heat: 100, currentDay: 14 } as GameState); flush('campaign_lose_heat');
  const t = getTarget('camp_nets');
  const base = cm();
  const alerts: [string, any][] = [
    ['seed', AlertFactory.createSeedAlert('Kano', t, 'RAINY_SEASON', 4)],
    ['proof', AlertFactory.createEvidenceAlert(EVIDENCE_DATA[1], false, 'AFFAIR', t, 2)],
    ['hype', AlertFactory.createEvidenceAlert(EVIDENCE_DATA[4], true, 'AFFAIR', t, 2)],
    ['protect', AlertFactory.createDefenseAlert(DEFENSE_DATA[1], 2, 'camp_nets')],
    ['channel', AlertFactory.createChannelAlert('press_dialect_fm', 'AFFAIR', t, 3)]
  ];
  alerts.forEach(([name, al]) => { SaveManager.save({ ...base, isPaused: false, notificationQueue: [al] } as GameState); flush(`campaign_alert_${name}`); });
  const hot = AlertFactory.evaluateTickTriggers({ ...base, heat: 75, coverUp: 70, currentDay: 12 } as GameState);
  if (hot) { SaveManager.save({ ...base, heat: 75, isPaused: false, notificationQueue: [hot.alert] } as GameState); flush('campaign_alert_tick'); }
}
console.log('seeds written to scratch/qa');
