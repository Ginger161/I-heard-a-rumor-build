// Spec conformance checks for the engine.
//   npx esbuild scripts/verify.ts --bundle --platform=node --format=cjs --outfile=<tmp>/v.cjs && node <tmp>/v.cjs
import { LOOKS } from '../src/engine/data/looks';
import { ALL_STATE_IDS, STATES_A_TO_Z, STATES_BY_ZONE, focusTransform, layoutLabels, stateLabel } from '../src/engine/data/stateLabels';
import { PLAN } from './difficultyPlan';
import { playStyleOf } from '../src/engine/data/playStyles';
import { Actions, seedSparkId } from '../src/engine/actions';
import { SimulationEngine, canTick, evaluateEndgame } from '../src/engine/simulation';
import { AlertFactory } from '../src/engine/alerts';
import { ZONE_STATE_IDS } from '../src/engine/data/zones';
import { computeMasterVariables, isFrozen, nationalBelieverPct } from '../src/engine/selectors';
import { applyEffects } from '../src/engine/effects';
import { BALANCE } from '../src/engine/balance';
import { TARGETS, TIERS, targetsInTier, describeTarget, getTarget } from '../src/engine/data/targets';
import { CHANNELS_DATA } from '../src/engine/data/channels';
import { EVENTS, buildEventAlert, pickEvent } from '../src/engine/events';
import {
  applyWin, bribeTarget, buyPerk, buyTier, emptyProfile, equipPerk, isTargetUnlocked, isTierUnlocked, loadProfile, starsFor, starsInTier
} from '../src/engine/profile';
import { heatMultiplier, spinMultiplier } from '../src/engine/selectors';
import { milestoneEffect } from '../src/engine/alerts';
import { SaveManager, sanitizeState } from '../src/engine/saveManager';
import { checkInvariants } from '../src/engine/invariants';
import { PARODY } from '../src/engine/data/parody';
import { channelFlavorLine } from '../src/engine/data/flavor';
import { EVIDENCE_DATA, getEvidenceVariant } from '../src/engine/data/evidence';
import { scaledStrength, AlertFactory } from '../src/engine/alerts';
import { temperamentMods } from '../src/engine/data/targets';
import { CLIMATES, describeClimate, getClimate } from '../src/engine/data/climates';
import { COPY, pickCopy } from '../src/engine/data/copy';
import { GIST, TAGLINES, TIPS, pickGist } from '../src/engine/data/copyUi';
import { SCHEMER_EVENT } from '../src/engine/events';
import { DAILY_POOL, dailyBonus, dailyCase, dailyStreak, mulberry32 } from '../src/engine/daily';
import { shareText } from '../src/engine/share';
import { dayTint, moodOf } from '../src/ui/mood';
import { canTick } from '../src/engine/simulation';
import { RATING_RANGES } from '../src/engine/data/ratings';
import { perkEffects } from '../src/engine/data/perks';
import type { GameState } from '../src/engine/types';
import { TRACKS as TRACKS_M, getTrack as getTrackM, validateTrack, melodyForBar, noteFromDegree } from '../src/ui/music/library';
import { chooseTrack, energyFor } from '../src/ui/music/director';
import { sanitizeSettings } from '../src/ui/settings';
import { verifyLicense, PREMIUM_FEATURES } from '../src/engine/premium';
import { MONETIZATION_LIVE, PAYMENT_URL } from '../src/config';
import { computeScore, makeEntry, decodeScores, encodeEntry, encodeBoard, dailyBoard, crewBoard, makeChallenge, encodeChallenge, decodeChallenge, challengeId } from '../src/engine/scores';
import { STORY_PACK, STORY_CHAPTERS, APPROACHES, seasonEnding } from '../src/engine/data/story';
import { validatePack, builtInIds, registerPack, unregisterPack, newBlankDef, validateTargetDef, estimateRating, PACK_SCHEMA_VERSION } from '../src/engine/data/targetPacks';
import type { TargetPack, TargetDef } from '../src/engine/data/targetPacks';
import { wipeData } from '../src/engine/wipe';
import { LICENSE_KEY } from '../src/engine/premium';
import { PROLOGUE, SCRIPTS, allPlotEvents } from '../src/engine/season/script';
import { CLUES, CLUE_BY_ID } from '../src/engine/season/clues';
import { applyStoryEffects, condHolds } from '../src/engine/story';
import { STRATEGIES, STRATEGIES_30, STRATEGY_TIPS } from '../src/engine/bots';
import { abilityEffects } from '../src/engine/alerts';
import type { AbilityDef, AbilityKind } from '../src/engine/data/targetTypes';
import { creationFee, decodeTarget, encodeTarget } from '../src/engine/arena';
import { RATING_KNOTS, ratingFromD } from '../src/engine/data/ratingCurve';
import { CHECK_ID, FAIR_FLOOR, describeChanges, runBotCheck, suggestEase } from '../src/engine/botCheck';
import { recordChapter, emptyStory, chapterUnlocked, repBand, perkIdFor, sanitizeStory, seasonComplete } from '../src/engine/story';
import { perkEffects, storyPerkId, parseStoryPerk } from '../src/engine/data/perks';
import { targetsInFolder } from '../src/engine/data/targets';

let pass = 0;
let fail = 0;
const ok = (name: string, cond: boolean, extra = '') => {
  if (cond) pass++; else fail++;
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${cond ? '' : '  ' + extra}`);
};
const fixed = (v: number) => () => v;

const fresh = (t: any = 'godfather', c: any = 'FINANCIAL') => Actions.startMatch(t, c);
const started = (t: any = 'godfather', c: any = 'FINANCIAL', st = 'kano'): GameState => {
  let s = Actions.plantSeed(fresh(t, c), st);
  s = Actions.collectSpark(s, seedSparkId(st));
  return Actions.dismissTopAlert(s);
};
const totalPop = (st: GameState) => Object.values(st.states).reduce((x, y) => x + y.population, 0);
const believersAt = (st: GameState, pct: number): GameState => {
  const out = { ...st, states: { ...st.states } };
  let need = (totalPop(st) * pct) / 100;
  for (const id of Object.keys(out.states)) {
    const n = Math.min(need, out.states[id].population * 0.9);
    out.states[id] = { ...out.states[id], believers: Math.floor(n), heard: 10 };
    need -= n;
    if (need <= 0) break;
  }
  return out;
};

// ---- Phase 1 ----
let s = fresh();
ok('frozen start values', s.currentDay === 1 && s.sparks === 0 && s.heat === 0 && !s.hasPlantedSeed && !s.hasPoppedFirstSpark && s.startingStateId === null && s.selectedStateId === null);
ok('tick is a no-op before first spark', SimulationEngine.processTick(s) === s);
ok('modals blocked in phase 1', Actions.setModal(s, 'CHANNELS_DESK').activeModal === 'NONE');
s = Actions.plantSeed(s, 'kano');
const k = s.states['kano'];
ok('plantSeed: heard=1, unaware-1, whisper flag, selected', k.heard === 1 && k.unaware === k.population - 1 && k.hasSpawnedFirstWhisper && s.selectedStateId === 'kano');
ok('seed spark 15 / 9999 ticks / id', s.activeSparks.length === 1 && s.activeSparks[0].amount === 15 && s.activeSparks[0].ticksRemaining === 9999 && s.activeSparks[0].id === 'spark_first_kano');
ok('still frozen after planting', SimulationEngine.processTick(s) === s);
s = Actions.collectSpark(s, 'spark_first_kano');
ok('pop: +15 sparks, popped, STREET_WHISPER queued', s.sparks === 15 && s.hasPoppedFirstSpark && s.notificationQueue[0]?.archetype === 'STREET_WHISPER');
ok('clock gated while alert is up', !canTick(s));
s = Actions.dismissTopAlert(s);
ok('clock runs after dismiss', canTick(s));
ok('tick gated by modal and pause', !canTick({ ...s, activeModal: 'EVIDENCE_DESK' }) && !canTick({ ...s, isPaused: true }));

// ---- Stage 2: spin detonation ----
const base = started();
const withSpin: GameState = { ...base, activeSpinBubbles: [{ id: 'sp', stateId: 'kano', doubtPenalty: 15, offsetX: 0, offsetY: 0, ticksRemaining: 1 }] };
const a = SimulationEngine.processTick(base, fixed(0.99));
const b = SimulationEngine.processTick(withSpin, fixed(0.99));
ok('spin detonation: +15 host Doubt', Math.abs(b.states['kano'].doubt - a.states['kano'].doubt - 15) < 0.5, `${b.states['kano'].doubt} vs ${a.states['kano'].doubt}`);
ok('spin detonation: +4 neighbour Doubt', Math.abs(b.states['jigawa'].doubt - a.states['jigawa'].doubt - 4) < 0.5);
ok('spin bubble removed after detonating', b.activeSpinBubbles.length === 0);

// ---- Regional sweep ----
const sw = started();
ZONE_STATE_IDS.SW.forEach(id => { sw.states[id] = { ...sw.states[id], heard: 5 }; });
const sweep = AlertFactory.evaluateTickTriggers({ ...sw, triggeredMilestones: ['HUB_lagos'] });
ok('Regional Sweep fires when a zone is fully infected', sweep?.milestoneId === 'SWEEP_SW' && sweep.alert.archetype === 'STREET_WHISPER', sweep?.milestoneId);

// ---- Target PR counter-offensives ----
const c1 = believersAt(started('iyaloja_general'), 21);
c1.triggeredMilestones = ['MASS_25', 'FIRST_STATE_FLIP', 'HUB_lagos', 'HUB_fct', 'HUB_rivers', 'CRASHOUT'];
const r1 = SimulationEngine.processTick({ ...c1, currentDay: 3 }, fixed(0.99));
ok('Counter-offensive 1 queued as TARGET_PR (STEADY target)', r1.notificationQueue.some(x => x.archetype === 'TARGET_PR' && x.id === 'target_pr_20'), JSON.stringify(r1.notificationQueue.map(x => x.id)));
ok('Counter-offensive 1 spawns spin bubbles', r1.activeSpinBubbles.length >= 2);
ok('Danjuma passive adds +10 Heat to every counter-offensive', milestoneEffect('TARGET_PR_20', { activeTargetId: 'minister', defensePurchases: {} })!.some(e => e.kind === 'heat' && e.amount === 10));
ok('a SAN Counter-Injunction cancels the Danjuma surcharge', !milestoneEffect('TARGET_PR_20', { activeTargetId: 'minister', defensePurchases: { san_injunction: 1 } })!.some(e => e.kind === 'heat'));

// ---- Defense styles ----
ok('SPIN_DOCTOR: Heat x0.8, Spin x1.5', Math.abs(heatMultiplier({ activeTargetId: 'cryptoking', perkId: null }) - 1.05 * 0.8 * (getTarget('cryptoking').mods.heatRate ?? 1)) < 1e-9 && spinMultiplier({ activeTargetId: 'cryptoking' }) === 1.5);
ok('IRON_FIST: Heat x1.4 on top of the tier, Spin x0.6', Math.abs(heatMultiplier({ activeTargetId: 'godfather', perkId: null }) - 1.35 * 1.4 * (getTarget('godfather').mods.heatRate ?? 1)) < 1e-9 && spinMultiplier({ activeTargetId: 'godfather' }) === 0.6);
ok('BALANCED has no style modifier', Math.abs(heatMultiplier({ activeTargetId: 'pothole_commissioner', perkId: null }) - 1.05 * (getTarget('pothole_commissioner').mods.heatRate ?? 1)) < 1e-9);

// ---- Evidence ----
let ev = started('godfather');
Object.keys(ev.states).forEach(id => { ev.states[id] = { ...ev.states[id], jaded: 1000, heard: 1000, doubt: 80 }; });
ev = { ...ev, sparks: 500, investigationProgress: 100 };
const t4 = Actions.leakEvidence(ev, 'ev_tier4_smoking_gun');
const n0 = t4.states['lagos'];
ok('Tier 4: -65 Doubt, jaded resurrected, 25% of Heard to Believers', n0.doubt === 15 && n0.jaded === 0 && n0.believers === 500 && n0.heard === 1500, JSON.stringify(n0));
ok('Tier 4 cost/heat/archetype', t4.sparks === 460 && t4.heat === 25 && t4.notificationQueue[0].archetype === 'BREAKING_FRONT');
ok('Tier locked below its Investigation %', Actions.leakEvidence({ ...ev, investigationProgress: 24 }, 'ev_tier1_wire').droppedEvidence.length === 0);
const t2 = Actions.leakEvidence(ev, 'ev_tier2_voice_memo').states['lagos'];
ok('Tier 2: 50% jaded->heard, 10% jaded->believers', t2.jaded === 400 && t2.heard === 1500 && t2.believers === 100, JSON.stringify(t2));
const fg = { ...started('godfather'), sparks: 100 };
const bf = Actions.leakEvidence(fg, 'ev_fake_whatsapp', fixed(0));
ok('Forgery backfire: +20 Doubt nationwide, +25 Heat, TARGET_PR', bf.heat === 25 && bf.states['lagos'].doubt === fg.states['lagos'].doubt + 20 && bf.notificationQueue[0].archetype === 'TARGET_PR');
const sc = Actions.leakEvidence(fg, 'ev_fake_whatsapp', fixed(0.99));
ok('Forgery success: -22 Doubt, +12 Heat, VIRAL_RECEIPT', sc.heat === 12 && sc.notificationQueue[0].archetype === 'VIRAL_RECEIPT' && sc.states['lagos'].doubt === Math.max(0, fg.states['lagos'].doubt - 22));
const hi = { ...fg, states: Object.fromEntries(Object.entries(fg.states).map(([i, st]) => [i, { ...st, doubt: 70 }])) } as GameState;
ok('Backfire risk 65% when avg Doubt > 55 (roll 0.6)', Actions.leakEvidence(hi, 'ev_fake_whatsapp', fixed(0.6)).heat === 25 && Actions.leakEvidence(fg, 'ev_fake_whatsapp', fixed(0.6)).heat === 12);

// ---- Defense ----
const df = { ...started('godfather'), sparks: 500, heat: 60 };
df.activeSpinBubbles = [{ id: 'x', stateId: 'kano', doubtPenalty: 15, offsetX: 0, offsetY: 0, ticksRemaining: 3 }];
let d = Actions.buyDefense(df, 'burner_sim');
d = Actions.buyDefense(d, 'burner_sim');
d = Actions.buyDefense(d, 'burner_sim');
const d4 = Actions.buyDefense(d, 'burner_sim');
ok('Burner SIM: -18 Heat each, max 3 uses', d.heat === 6 && d4.defensePurchases['burner_sim'] === 3 && d4.sparks === d.sparks);
const san = Actions.buyDefense(df, 'san_injunction');
ok('SAN: -20 Heat, clears Spin bubbles, SECURITY_WIRE', san.heat === 40 && san.activeSpinBubbles.length === 0 && san.notificationQueue[0].archetype === 'SECURITY_WIRE');
ok('Safehouse -45 Heat, one-time', Actions.buyDefense(Actions.buyDefense(df, 'safehouse'), 'safehouse').heat === 15);
const wb = SimulationEngine.processTick({ ...Actions.buyDefense(df, 'whistleblower'), notificationQueue: [] }, fixed(0.99));
ok('Whistleblower: Investigation +6.6/day (3.6 base + 3)', Math.abs(wb.investigationProgress - 6.6) < 0.01, String(wb.investigationProgress));
const px = SimulationEngine.processTick({ ...Actions.buyDefense(df, 'proxy_relay'), notificationQueue: [] }, fixed(0.99));
const noPx = SimulationEngine.processTick({ ...df, notificationQueue: [] }, fixed(0.99));
ok('Proxy relay lowers daily Heat gain', px.heat - (df.heat - 15) < noPx.heat - df.heat + 0.01, `${px.heat} ${noPx.heat}`);

// ---- Endgame ----
ok('WON at >=75% Believers', evaluateEndgame(believersAt(started(), 76)) === 'WON');
ok('LOST_HEAT at 100 Heat', evaluateEndgame({ ...started(), heat: 100 }) === 'LOST_HEAT');
const bud = started().dayBudget;
ok('LOST_TIME only when day > the tier budget', evaluateEndgame({ ...started(), currentDay: bud }) === 'PLAYING' && evaluateEndgame({ ...started(), currentDay: bud + 1 }) === 'LOST_TIME');
const endTick = SimulationEngine.processTick({ ...started(), currentDay: bud }, fixed(0.99));
ok('the final tick ends the game LOST_TIME and clears queue', endTick.status === 'LOST_TIME' && endTick.notificationQueue.length === 0);
ok('believers pct helper', nationalBelieverPct(believersAt(started(), 50).states) > 49);

// ---- Anti-spam ----
const spam = { ...started(), heat: 95, investigationProgress: 100, currentDay: bud - 3 };
const sp = SimulationEngine.processTick(spam, fixed(0.99));
ok('only ONE background alert pushed per tick', sp.notificationQueue.length === 1 && sp.triggeredMilestones.length === 1, String(sp.notificationQueue.length));
ok('highest priority wins (HEAT_90)', sp.triggeredMilestones[0] === 'HEAT_90', sp.triggeredMilestones[0]);

// ======================= v2 RULES =======================

// ---- Data integrity ----
ok('at least 10 Targets per tier plus a 2-creator Spotlight', TIERS.every(tr => targetsInTier(tr).length >= 10) && TARGETS.filter(x => x.folder === 'SPOTLIGHT').length === 2);
ok('target ids are unique', new Set(TARGETS.map(x => x.id)).size === TARGETS.length);
ok('every target has 3 scandals in distinct categories', TARGETS.every(x => x.scandals.length === 3 && new Set(x.scandals.map(sd => sd.category)).size === 3));
ok('every target has 1-3 abilities with sane timing', TARGETS.every(x => x.abilities.length >= 1 && x.abilities.length <= 3 && x.abilities.every(a => a.every >= 5 && a.start >= 6 && a.strength > 0)));
ok('every target auto-describes its mechanics', TARGETS.every(x => describeTarget(x).length >= 1));
ok('all four original targets are kept', ['godfather', 'televangelist', 'cryptoking', 'minister'].every(id => TARGETS.some(x => x.id === id)));

// ---- Soft caps ----
const allOwned = { unlockedChannels: CHANNELS_DATA.map(c => c.id), scandalCategory: 'FINANCIAL' as const, frozenChannels: {}, currentDay: 5, freshness: 100, timedEffects: [] };
const maxed = computeMasterVariables(allOwned);
ok('stats are soft-capped even with all 26 channels', maxed.velocity < BALANCE.capVelocity && maxed.credibility < BALANCE.capCredibility && maxed.rawVelocity > BALANCE.capVelocity, JSON.stringify(maxed));
const few = computeMasterVariables({ ...allOwned, unlockedChannels: ['street_agbero', 'social_whatsapp'] });
ok('early stats are near-linear (little cap bite)', few.velocity > few.rawVelocity * 0.6, `${few.velocity} vs ${few.rawVelocity}`);

// ---- Freshness ----
const stale = computeMasterVariables({ ...allOwned, freshness: 0 });
ok('a stale story is weaker', stale.credibility < maxed.credibility && stale.velocity < maxed.velocity);
const fs0 = started();
const fs1 = SimulationEngine.processTick(fs0, fixed(0.99));
ok('Freshness decays daily', fs1.freshness < fs0.freshness && fs1.freshness >= BALANCE.freshnessFloor);
ok('buying a channel refreshes the story', Actions.buyChannel({ ...fs1, sparks: 100 }, 'street_agbero').freshness > fs1.freshness);

// ---- Cover-Up ----
const cu0 = started();
const cu1 = SimulationEngine.processTick(cu0, fixed(0.99));
ok('Cover-Up grows every day', cu1.coverUp > 0);
ok('Cover-Up >= 100 ends the game LOST_COVERUP', SimulationEngine.processTick({ ...cu0, coverUp: 99.5 }, fixed(0.99)).status === 'LOST_COVERUP');
ok('endgame order: win beats cover-up', evaluateEndgame({ ...believersAt(started(), 80), coverUp: 100 }) === 'WON');
const evCu = { ...started(), sparks: 100, investigationProgress: 100, coverUp: 50, freshness: 40 };
const evOut = Actions.leakEvidence(evCu, 'ev_tier3_footage');
ok('genuine evidence lowers Cover-Up and refreshes the story', evOut.coverUp === 34 && evOut.freshness === 85, `${evOut.coverUp} ${evOut.freshness}`);
const bfOut = Actions.leakEvidence(evCu, 'ev_fake_whatsapp', fixed(0));
ok('forgery backfire raises Cover-Up +15 and drains Freshness', bfOut.coverUp === 65 && bfOut.freshness === 30, `${bfOut.coverUp} ${bfOut.freshness}`);
ok('Cover-Up baselines rise with the tier', BALANCE.tier.coverUp.every((c, i, a) => i === 0 || c > a[i - 1]));

// ---- Doubt now has a source ----
const dbt = { ...started(), coverUp: 90, unlockedChannels: [] as string[] };
const dbtTick = SimulationEngine.processTick(dbt, fixed(0.99));
ok('Doubt rises in an infected state under high Cover-Up', dbtTick.states['kano'].doubt > dbt.states['kano'].doubt);
ok('target passives set starting Doubt (Flock Immunity = 25 flat)', Object.values(fresh('televangelist').states).every(x => x.doubt === 25));
ok('tag passives add Doubt (Iyaloja: GRASSROOTS +8)', fresh('iyaloja_general').states['kogi'].doubt === fresh('park_chairman').states['kogi'].doubt + 8);

// ---- Frozen channels, freezes and the SAN shield ----
const fz = { ...started('minister'), unlockedChannels: ['street_agbero', 'social_whatsapp'], sparks: 200 };
const fzRes = applyEffects(fz, [{ kind: 'freeze', days: 3 }], fixed(0), 'x');
const fzId = Object.keys(fzRes.state.frozenChannels)[0];
ok('freeze effect freezes exactly one owned channel', Object.keys(fzRes.state.frozenChannels).length === 1 && isFrozen(fzRes.state, fzId));
const frozenVars = computeMasterVariables(fzRes.state);
const baseVars = computeMasterVariables(fz);
ok('a frozen channel contributes nothing', frozenVars.rawVelocity < baseVars.rawVelocity);
ok('frozen channels thaw after their last day', !isFrozen({ frozenChannels: fzRes.state.frozenChannels, currentDay: fz.currentDay + 4 }, fzId));
const san2 = Actions.buyDefense({ ...fzRes.state, sparks: 100 }, 'san_injunction');
ok('SAN thaws frozen channels and grants a 2-freeze shield', Object.keys(san2.frozenChannels).length === 0 && san2.injunctionShield === 2);
const shielded = applyEffects(san2, [{ kind: 'freeze', days: 3 }], fixed(0), 'y');
ok('the shield absorbs a freeze', Object.keys(shielded.state.frozenChannels).length === 0 && shielded.state.injunctionShield === 1 && shielded.notes[0].includes('blocked'));

// ---- Target abilities ----
const abT = { ...started('cryptoking'), unlockedChannels: ['street_agbero'], currentDay: 8, abilityNext: [9] };
const abOut = SimulationEngine.processTick(abT, fixed(0.99));
ok('a due ability fires as a TARGET_PR alert and spawns spin bubbles', abOut.notificationQueue.some(x => x.archetype === 'TARGET_PR' && x.stampText === 'BOT FARM ACTIVATED') && abOut.activeSpinBubbles.length >= 3, JSON.stringify(abOut.notificationQueue.map(x => x.stampText)));
ok('ability reschedules itself', abOut.abilityNext[0] > 9 + 3);
const injT = { ...started('minister'), unlockedChannels: ['street_agbero', 'social_whatsapp'], currentDay: 8, abilityNext: [9] };
const injOut = SimulationEngine.processTick(injT, fixed(0.3));
ok('Danjuma injunction ability freezes a channel', Object.keys(injOut.frozenChannels).length === 1);
const earlyAb = SimulationEngine.processTick({ ...started('iyaloja_general'), currentDay: 8, abilityNext: [20] }, fixed(0.99));
ok('abilities are not cast before their day', earlyAb.notificationQueue.every(x => !x.id.startsWith('ability')));

// ---- Events and informant decisions ----
const evS = { ...started(), sparks: 50, currentDay: 6 };
const evAlert = buildEventAlert(EVENTS.find(e => e.id === 'tip_clerk')!, evS);
const withEvent: GameState = { ...evS, notificationQueue: [evAlert] };
ok('decision cards cannot be dismissed', Actions.dismissTopAlert(withEvent) === withEvent);
const paid = Actions.chooseOption(withEvent, 'pay', fixed(0.5));
ok('paying the clerk costs 12 and grants +12% Investigation', paid.sparks === 38 && paid.investigationProgress === 12 && paid.notificationQueue.length === 0, `${paid.sparks} ${paid.investigationProgress}`);
const broke = Actions.chooseOption({ ...withEvent, sparks: 5 }, 'pay');
ok('unaffordable choices are refused', broke.sparks === 5 && broke.notificationQueue.length === 1);
ok('free choices still work when broke', Actions.chooseOption({ ...withEvent, sparks: 0 }, 'photocopy').heat === 5);
const zoned = buildEventAlert(EVENTS.find(e => e.id === 'power_outage')!, evS, 'NW');
const zonedOut = Actions.chooseOption({ ...evS, notificationQueue: [zoned] }, 'ride', fixed(0.5));
ok('a blackout slows its zone via a timed effect', zonedOut.timedEffects.some(e => e.kind === 'ZONE_FRICTION' && e.zone === 'NW' && e.mult === 0.6));
const bigKano = (extra: Partial<GameState>): GameState => {
  const b = started();
  return { ...b, ...extra, states: { ...b.states, kano: { ...b.states['kano'], heard: 400000, unaware: b.states['kano'].unaware - 400000 } } };
};
const spreadCount = (st: GameState) => Object.values(st.states).filter(x => x.heard + x.believers > 0).length;
const hwNo = SimulationEngine.processTick(bigKano({}), fixed(0.1));
const hwYes = SimulationEngine.processTick(bigKano({ timedEffects: [{ id: 't', label: 'Travel rush', kind: 'HIGHWAY_MULT', until: 99, mult: 4 }] }), fixed(0.2));
const hwBase = SimulationEngine.processTick(bigKano({}), fixed(0.2));
ok('travel-rush multiplies land-border spread', spreadCount(hwYes) > spreadCount(hwBase) && spreadCount(hwNo) >= 1, `${spreadCount(hwYes)} vs ${spreadCount(hwBase)}`);
ok('every event offers choices with effects arrays', EVENTS.every(e => e.choices('NW').length >= 1 && e.choices('NW').every(c => Array.isArray(c.effects))));

// ======================= BLEND: roster, AI personalities, chatter, stars, envelopes, perks =======================
const tgt = (id: string) => TARGETS.find(x => x.id === id)!;

// ---- Roster and ratings ----
ok('every Target has a full AI profile with 5 non-empty chatter lines', TARGETS.every(x => Object.values(x.ai.chatter).length === 5 && Object.values(x.ai.chatter).every(l => l.length > 5)));
ok('weakness and resistance lanes always differ', TARGETS.every(x => x.ai.weaknessBranch !== x.ai.resistanceBranch));
ok('every Target has a distinct PR Rating (the rating is a position on the difficulty ladder)', new Set(TARGETS.filter(x => !x.storyOnly).map(x => x.prRating)).size === TARGETS.filter(x => !x.storyOnly).length);
ok('every rating sits inside its folder range (Spotlight excepted)', TARGETS.filter(x => x.folder !== 'SPOTLIGHT').every(x => x.prRating >= RATING_RANGES[x.folder as number][0] && x.prRating <= RATING_RANGES[x.folder as number][1]), TARGETS.filter(x => x.folder !== 'SPOTLIGHT' && (x.prRating < RATING_RANGES[x.folder as number][0] || x.prRating > RATING_RANGES[x.folder as number][1])).map(x => x.id + ':' + x.prRating).join(','));
ok('folders are placed per the design doc (Godfather T4, Apostle T3, Danjuma T3, CryptoKing T2)', tgt('godfather').folder === 4 && tgt('televangelist').folder === 3 && tgt('minister').folder === 3 && tgt('cryptoking').folder === 2);
ok('Spotlight creators keep their design-doc temperament and style', tgt('lord_lambo').ai.temperament === 'THE_CRASHOUT' && tgt('lord_lambo').ai.defenseStyle === 'SPIN_DOCTOR' && tgt('daddy_freeze_frame').ai.temperament === 'THE_STOIC' && tgt('daddy_freeze_frame').ai.defenseStyle === 'SPIN_DOCTOR');
ok('Spotlight scandals match the design doc', tgt('lord_lambo').scandals[0].category === 'LEAKED_MEDIA' && tgt('daddy_freeze_frame').scandals[0].category === 'FINANCIAL');
ok('each tier plays on its own shrinking clock', fresh('iyaloja_general').dayBudget === 36 && fresh('cryptoking').dayBudget === 30 && fresh('minister').dayBudget === 28 && fresh('godfather').dayBudget === 27 && fresh('the_landslide').dayBudget === 26);

// ---- Weakness / resistance lanes ----
const lane = (id: string) => computeMasterVariables({ unlockedChannels: ['press_dialect_fm'], scandalCategory: 'FINANCIAL', frozenChannels: {}, currentDay: 5, freshness: 100, timedEffects: [], activeTargetId: id }).rawVelocity;
ok('a Target\'s weak lane is 1.25x and its resisted lane 0.75x', lane('forex_flexer') > lane('park_chairman') && lane('park_chairman') > lane('owambe_dj') * 0 && lane('lga_councillor') < lane('park_chairman'), `${lane('forex_flexer')} ${lane('park_chairman')} ${lane('lga_councillor')}`);

// ---- Temperaments ----
const crash = believersAt(started('park_chairman'), 16);
crash.triggeredMilestones = ['MASS_25', 'FIRST_STATE_FLIP', 'HUB_lagos', 'HUB_fct', 'HUB_rivers'];
const crashOut = SimulationEngine.processTick({ ...crash, currentDay: 3 }, fixed(0.99));
ok('THE_CRASHOUT rants at 15% Believers', crashOut.notificationQueue.some(x => x.id === 'crashout'), JSON.stringify(crashOut.notificationQueue.map(x => x.id)));
ok('the rant gives +10% Velocity and spawns Spin bubbles', crashOut.timedEffects.some(e => e.kind === 'VELOCITY_MULT' && e.mult === 1.1) && crashOut.activeSpinBubbles.length >= 2);
ok('the Crashout chatter fires its critical line', crashOut.chatter?.event === 'onCritical');
const stoicState = believersAt(started('distinguished_senator'), 21);
stoicState.triggeredMilestones = ['MASS_25', 'FIRST_STATE_FLIP', 'HUB_lagos', 'HUB_fct', 'HUB_rivers'];
const stoicEarly = SimulationEngine.processTick({ ...stoicState, currentDay: 3 }, fixed(0.99));
ok('THE_STOIC skips the early counter-offensive', !stoicEarly.notificationQueue.some(x => x.id === 'target_pr_20' || x.id === 'target_pr_45'), JSON.stringify(stoicEarly.notificationQueue.map(x => x.id)));
const stoicLate = believersAt(started('distinguished_senator'), 56);
stoicLate.triggeredMilestones = ['MASS_25', 'MASS_50', 'FIRST_STATE_FLIP', 'HUB_lagos', 'HUB_fct', 'HUB_rivers', 'SIGNATURE'];
const ambush = SimulationEngine.processTick({ ...stoicLate, currentDay: 3 }, fixed(0.99));
ok('THE_STOIC ambushes at 55% Believers', ambush.notificationQueue.some(x => x.id === 'stoic_ambush') && ambush.coverUp >= 10 && ambush.activeSpinBubbles.length >= 2, JSON.stringify(ambush.notificationQueue.map(x => x.id)));
ok('a STEADY target is unaffected by either temperament', !r1.notificationQueue.some(x => x.id === 'crashout' || x.id === 'stoic_ambush'));

// ---- Signature move ----
const sig = believersAt(started('cryptoking'), 51);
sig.triggeredMilestones = ['MASS_25', 'MASS_50', 'FIRST_STATE_FLIP', 'HUB_lagos', 'HUB_fct', 'HUB_rivers', 'TARGET_PR_20', 'TARGET_PR_45', 'CRASHOUT'];
const sigOut = SimulationEngine.processTick({ ...sig, currentDay: 3 }, fixed(0.99));
ok('the signature move fires once at 50% Believers at double strength', sigOut.notificationQueue.some(x => x.stampText.startsWith('SIGNATURE MOVE')) && sigOut.activeSpinBubbles.length >= 6 && sigOut.triggeredMilestones.includes('SIGNATURE'), JSON.stringify(sigOut.notificationQueue.map(x => x.stampText)));
const sigAgain = SimulationEngine.processTick({ ...sigOut, notificationQueue: [], currentDay: 4 }, fixed(0.99));
ok('the signature move never fires twice', !sigAgain.notificationQueue.some(x => x.stampText.startsWith('SIGNATURE MOVE')));

// ---- Live Polaroid chatter ----
let ch = Actions.plantSeed(fresh('park_chairman'), 'kano');
ch = Actions.collectSpark(ch, 'spark_first_kano');
ok('no chatter while the Ground Zero card is up', ch.chatter === null);
ch = Actions.dismissTopAlert(ch);
ok('dismissing the Ground Zero card makes the Target speak (onStart)', ch.chatter?.event === 'onStart' && ch.chatter.text === tgt('park_chairman').ai.chatter.onStart);
const chBuy = Actions.buyChannel({ ...ch, sparks: 100 }, 'street_agbero');
ok('buying a channel triggers onChannelBought', chBuy.chatter?.event === 'onChannelBought' && chBuy.chatter.id !== ch.chatter!.id);
const chEv = Actions.leakEvidence({ ...ch, sparks: 100, investigationProgress: 100 }, 'ev_tier1_wire');
ok('leaking evidence triggers onEvidenceDropped', chEv.chatter?.event === 'onEvidenceDropped');
const chBf = Actions.leakEvidence({ ...ch, sparks: 100 }, 'ev_fake_whatsapp', fixed(0));
ok('an exposed forgery triggers onBackfire and counts as a backfire', chBf.chatter?.event === 'onBackfire' && chBf.backfires === 1);
ok('a clean forgery does not count as a backfire', Actions.leakEvidence({ ...ch, sparks: 100 }, 'ev_fake_whatsapp', fixed(0.99)).backfires === 0);
const crit = SimulationEngine.processTick({ ...started(), heat: 91, triggeredMilestones: ['HEAT_40', 'HEAT_70'] }, fixed(0.99));
ok('Heat 90% queues the DSS wire and makes the Target say its critical line', crit.notificationQueue[0]?.id === 'heat_90' && crit.chatter?.event === 'onCritical' && crit.chatter.text === tgt('godfather').ai.chatter.onCritical, JSON.stringify([crit.notificationQueue[0]?.id, crit.chatter]));
const saveStore: Record<string, string> = {};
(globalThis as any).localStorage = { getItem: (k: string) => saveStore[k] ?? null, setItem: (k: string, v: string) => { saveStore[k] = v; }, removeItem: (k: string) => { delete saveStore[k]; } };
SaveManager.save({ ...chBuy });
ok('chatter and map events are transient: never saved', JSON.parse(saveStore['rumor_game_save_v9']).chatter === null && chBuy.chatter !== null);

// ---- Stars ----
const wonAt = (day: number, heat: number, backfires = 0): GameState => ({ ...started('iyaloja_general'), status: 'WON' as const, currentDay: day, peakHeat: heat, backfires });
const B = fresh('iyaloja_general').dayBudget; // 36
ok('1 star: any win', starsFor(wonAt(B, 99)) === 1);
ok('2 stars: within 75% of the clock and Heat < 75', starsFor(wonAt(Math.floor(B * 0.75), 74)) === 2 && starsFor(wonAt(Math.floor(B * 0.75) + 1, 40)) === 1 && starsFor(wonAt(10, 75)) === 1);
ok('3 stars: within 60% of the clock, Heat < 50, no exposed forgeries', starsFor(wonAt(Math.floor(B * 0.6), 49)) === 3 && starsFor(wonAt(Math.floor(B * 0.6), 49, 1)) === 2 && starsFor(wonAt(10, 50)) === 2);
ok('a loss earns no stars', starsFor({ ...wonAt(5, 0), status: 'LOST_HEAT' as const }) === 0);

// ---- Brown Envelopes ----
let prof = emptyProfile();
ok('new players start with 50 envelopes', prof.envelopes === 50);
const w1 = applyWin(prof, wonAt(B, 99), 76)!;
ok('first takedown: +50, plus +15 per new star', w1.rewards.total === 65 && w1.profile.envelopes === 115 && w1.profile.targetStars['iyaloja_general'] === 1);
const w2 = applyWin(w1.profile, wonAt(B, 99), 76)!;
ok('replay with no improvement: +15 only', w2.rewards.total === 15 && w2.profile.targetStars['iyaloja_general'] === 1);
const w3 = applyWin(w2.profile, wonAt(Math.floor(B * 0.6), 10), 80)!;
ok('replay with a 1->3 star improvement: +15 replay and +30 for two new stars', w3.rewards.total === 45 && w3.profile.targetStars['iyaloja_general'] === 3);
ok('stars never go down', applyWin(w3.profile, wonAt(B, 99), 76)!.profile.targetStars['iyaloja_general'] === 3);
const wonAssisted = { ...wonAt(Math.floor(B * 0.5), 5), assisted: true, dailyKey: '2030-01-01' };
const wA = applyWin(emptyProfile(), wonAssisted, 80)!;
ok('Assist Mode caps a win at 1 star, halves envelopes and skips the Daily bonus', wA.rewards.stars === 1 && wA.rewards.total === Math.floor(BALANCE.envelopesFirstWin * BALANCE.assistRewardShare) + Math.floor(BALANCE.envelopesPerNewStar * BALANCE.assistRewardShare) && !wA.rewards.breakdown.some(b => /Daily/.test(b.label)), JSON.stringify(wA.rewards));
const wT = applyWin(emptyProfile(), { ...wonAt(Math.floor(B * 0.5), 5), training: true }, 80)!;
ok('a Training Case pays nothing and leaves the profile untouched', wT.rewards.total === 0 && JSON.stringify(wT.profile) === JSON.stringify(emptyProfile()));
ok('new matches carry assisted/training/story flags', Actions.startMatch('iyaloja_general', 'FINANCIAL', null, undefined, { assisted: true, training: true }).assisted === true && Actions.startMatch('iyaloja_general', 'FINANCIAL').training === false);
ok('a win is archived with its stars', w3.profile.archive[0].stars === 3 && w3.profile.archive.length === 3);
ok('only wins pay out', applyWin(prof, { ...wonAt(5, 0), status: 'LOST_TIME' as const }, 10) === null);

// ---- Unlocks, bribes and buy-outs ----
const T1 = targetsInTier(1);
let up = emptyProfile();
ok('tier 1 and the Spotlight are open; tier 2 is sealed', isTierUnlocked(up, 1) && !isTierUnlocked(up, 2) && isTargetUnlocked(up, tgt('lord_lambo')) && isTargetUnlocked(up, tgt('iyaloja_general')) && !isTargetUnlocked(up, tgt('cryptoking')));
up = { ...up, targetStars: { [T1[0].id]: 2, [T1[1].id]: 1 } };
ok('3 stars in a tier is not enough', starsInTier(up, 1) === 3 && !isTierUnlocked(up, 2));
up = { ...up, targetStars: { [T1[0].id]: 2, [T1[1].id]: 2 } };
ok('4 stars in a tier opens the next tier', starsInTier(up, 1) === 4 && isTierUnlocked(up, 2) && isTargetUnlocked(up, tgt('cryptoking')) && !isTierUnlocked(up, 3));
ok('stars on one target can carry the tier (3 + 1 across two targets)', isTierUnlocked({ ...emptyProfile(), targetStars: { [T1[0].id]: 3, [T1[1].id]: 1 } }, 2));
const rich = { ...emptyProfile(), envelopes: 500 };
const bribed = bribeTarget(rich, 'cryptoking')!;
ok('a bribe costs 100 and unseals exactly one Target', bribed.envelopes === 400 && isTargetUnlocked(bribed, tgt('cryptoking')) && !isTargetUnlocked(bribed, tgt('nollywood_queen')) && !isTierUnlocked(bribed, 2));
ok('a bribe fails when poor or when already open', bribeTarget(emptyProfile(), 'cryptoking') === null && bribeTarget(rich, 'iyaloja_general') === null && bribeTarget(rich, 'lord_lambo') === null);
const bought = buyTier(rich, 3)!;
ok('buying a folder opens every Target in it (3 = 120)', bought.envelopes === 380 && isTierUnlocked(bought, 3) && isTargetUnlocked(bought, tgt('minister')));
ok('folder buy-out fails when poor or already open', buyTier(emptyProfile(), 4) === null && buyTier(bought, 3) === null);
ok('unlock-all override opens everything', isTargetUnlocked(emptyProfile(), tgt('the_cabal'), true));

// ---- Perks ----
ok('motor-park perk: first Whisper spark is 22', Actions.plantSeed(Actions.startMatch('iyaloja_general', 'FINANCIAL', 'motor_park_boss'), 'kano').activeSparks[0].amount === 22 && Actions.plantSeed(fresh('iyaloja_general'), 'kano').activeSparks[0].amount === 15);
ok('mole perk: Investigation starts at 25%', Actions.startMatch('iyaloja_general', 'FINANCIAL', 'secretariat_mole').investigationProgress === 25 && fresh('iyaloja_general').investigationProgress === 0);
ok('bailiff perk: starts with an injunction shield', Actions.startMatch('iyaloja_general', 'FINANCIAL', 'bailiff_friend').injunctionShield === 1);
ok('burner-rig perk: Heat 20% slower', Math.abs(heatMultiplier({ activeTargetId: 'iyaloja_general', perkId: 'burner_rig' }) - heatMultiplier({ activeTargetId: 'iyaloja_general', perkId: null }) * 0.8) < 1e-9);
ok('press-club perk: Freshness decays 25% slower', (() => { const a = SimulationEngine.processTick(Actions.plantSeed(Actions.startMatch('iyaloja_general', 'FINANCIAL', 'press_club'), 'kano') && started('iyaloja_general'), fixed(0.99)); const b = SimulationEngine.processTick({ ...started('iyaloja_general'), perkId: 'press_club' }, fixed(0.99)); return (100 - b.freshness) < (100 - a.freshness); })());
const forgeBase = { ...started('iyaloja_general'), sparks: 100 };
ok('fact-check perk halves forgery backfire risk (roll 0.2: exposed without it, safe with it)', Actions.leakEvidence(forgeBase, 'ev_fake_whatsapp', fixed(0.2)).backfires === 1 && Actions.leakEvidence({ ...forgeBase, perkId: 'fact_check_immunity' }, 'ev_fake_whatsapp', fixed(0.2)).backfires === 0);
ok('perk effects are looked up safely', Object.keys(perkEffects(null)).length === 0 && Object.keys(perkEffects('nope')).length === 0);
const bp = buyPerk({ ...emptyProfile(), envelopes: 200 }, 'burner_rig')!;
ok('buying a perk costs envelopes, auto-equips the first, and cannot be repeated', bp.envelopes === 100 && bp.equippedPerkId === 'burner_rig' && buyPerk(bp, 'burner_rig') === null && buyPerk(emptyProfile(), 'fact_check_immunity') === null);
ok('only one perk equipped at a time; unowned perks cannot be equipped', equipPerk(bp, 'motor_park_boss').equippedPerkId === 'burner_rig' && equipPerk(bp, null).equippedPerkId === null);

// ---- Legacy profile migration ----
const store: Record<string, string> = {};
(globalThis as any).localStorage = { getItem: (k: string) => store[k] ?? null, setItem: (k: string, v: string) => { store[k] = v; }, removeItem: (k: string) => { delete store[k]; } };
store['rumor_profile_v1'] = JSON.stringify({ version: 1, wins: { iyaloja_general: 2, park_chairman: 1 }, archive: [{ targetId: 'park_chairman', targetName: 'x', scandalTitle: 'y', day: 20, believers: 77, finishedAt: 1 }] });
const mig = loadProfile();
ok('legacy wins migrate to 1 star each and earn their envelopes', mig.targetStars['iyaloja_general'] === 1 && mig.targetStars['park_chairman'] === 1 && mig.envelopes === 50 + 2 * 65 && mig.archive[0].stars === 1);
ok('migrated profile is stored under the new key', !!store['rumor_meta_profile_v1']);

// ======================= VARIETY, PARODY, CLIMATES, DAILY, FUZZ =======================

// ---- Parody layer ----
const REAL_NAME_COLLISIONS = ['Ayodeji', 'Balogun', 'Dangote', 'Davido', 'Wizkid', 'Burna Boy', 'Aliko', 'Tinubu', 'Buhari', 'Obasanjo', 'Peter Obi', 'Oyedepo', 'Adeboye', 'Hushpuppi'];
ok('no Target carries a real person\'s name', TARGETS.every(x => !REAL_NAME_COLLISIONS.some(r => (x.fullName + ' ' + x.shortName).includes(r))), TARGETS.filter(x => REAL_NAME_COLLISIONS.some(r => (x.fullName + x.shortName).includes(r))).map(x => x.id).join(','));
ok('61 Targets: 13/12/13/11/10 plus a 2-creator Spotlight', TARGETS.filter(x => !x.storyOnly).length === 61 && targetsInTier(1).length === 13 && targetsInTier(2).length === 12 && targetsInTier(3).length === 13 && targetsInTier(4).length === 11 && targetsInTier(5).length === 10);
ok('parody Targets are flagged and use the parody names', tgt('afrobeats_star').parody && tgt('afrobeats_star').shortName === 'Davi-Dough' && tgt('african_giant').shortName === 'Wizz-Kidd' && tgt('richest_man').shortName === 'Dan-Goat' && !tgt('iyaloja_general').parody);
ok('every parody Target keeps three scandals, each with a comic title and the same category', Object.keys(PARODY).every(id => tgt(id).scandals.length === 3 && tgt(id).scandals.every((sd, i) => sd.title === PARODY[id].scandals[i])));
ok('parody Targets never get an accusatory flavor or evidence line', (() => {
  const accusatory = /loot|stole|steal|fraud|launder|offshore|bribe|affair|mistress|side-chick|forged|fake degree|billion/i;
  return Object.keys(PARODY).every(id => {
    const t = tgt(id);
    const lines = CHANNELS_DATA.map(c => channelFlavorLine(c, t.scandals[0].category, t, 'x'));
    const ev = EVIDENCE_DATA.map(e => getEvidenceVariant(e, t.scandals[0].category, true));
    const copy = [...lines, ...ev.flatMap(v => [v.name, ...v.flavor]), ...t.scandals.map(sd => sd.title)];
    return copy.every(l => !accusatory.test(l));
  });
})(), 'accusatory wording found in a parody Target');
ok('non-parody Targets still use the scandal-matched flavor', !tgt('iyaloja_general').parody && CHANNELS_DATA.some(c => channelFlavorLine(c, 'FINANCIAL', tgt('iyaloja_general'), 'x') !== channelFlavorLine(c, 'FINANCIAL', tgt('afrobeats_star'), 'x')));

// ---- Playstyle variety ----
const styles = new Set(TARGETS.map(x => x.ai.defenseStyle));
const temperaments = new Set(TARGETS.map(x => x.ai.temperament));
ok('all 5 defense styles and 6 temperaments are in use', styles.size === 5 && temperaments.size === 6, `${[...styles]} ${[...temperaments]}`);
ok('no style or temperament dominates the roster (none above 30%)', ['SPIN_DOCTOR', 'IRON_FIST', 'LAWYER_UP', 'DISTRACTOR', 'BALANCED'].every(st => TARGETS.filter(x => x.ai.defenseStyle === st).length <= TARGETS.length * 0.3));
ok('LAWYER_UP: injunctions last longer', scaledStrength({ kind: 'INJUNCTION', every: 8, start: 9, strength: 3, stamp: '', headline: '', line: '' }, tgt('minister')) === 4 + 0 || scaledStrength({ kind: 'INJUNCTION', every: 8, start: 9, strength: 3, stamp: '', headline: '', line: '' }, tgt('minister')) === 4);
ok('DISTRACTOR: distractions hit 30% harder', scaledStrength({ kind: 'DISTRACTION', every: 8, start: 9, strength: 10, stamp: '', headline: '', line: '' }, tgt('football_chairman')) === 13);
ok('THE_SHOWMAN: abilities hit 25% softer and come 25% more often', scaledStrength({ kind: 'COUNTER_STORY', every: 8, start: 9, strength: 8, stamp: '', headline: '', line: '' }, tgt('owambe_dj')) === 6 && temperamentMods(tgt('owambe_dj')).abilityEvery === 0.75);
const paranoidEv = (id: string) => Actions.leakEvidence({ ...started(id), sparks: 100, investigationProgress: 100 }, 'ev_tier1_wire').heat;
ok('THE_PARANOID: genuine evidence costs 50% more Heat', Math.abs(paranoidEv('land_guard') - paranoidEv('iyaloja_general') * 1.5) < 1e-9, `${paranoidEv('land_guard')} vs ${paranoidEv('iyaloja_general')}`);
const sch = believersAt(started('lga_councillor'), 31);
sch.triggeredMilestones = ['MASS_25', 'FIRST_STATE_FLIP', 'HUB_lagos', 'HUB_fct', 'HUB_rivers', 'TARGET_PR_20'];
const schOut = SimulationEngine.processTick({ ...sch, currentDay: 3 }, fixed(0.99));
const bait = schOut.notificationQueue.find(x => x.eventId === 'schemer_honeypot');
ok('THE_SCHEMER plants a bait card at 30% Believers', !!bait && bait.choices!.length === 3, JSON.stringify(schOut.notificationQueue.map(x => x.id)));
ok('the bait offers a free choice', bait!.choices!.some(c => !c.cost));
const baitState: GameState = { ...schOut, notificationQueue: [bait!], sparks: 50 };
const ran = Actions.chooseOption(baitState, 'run', fixed(0.5));
ok('running the bait costs Cover-Up and Heat', ran.coverUp >= baitState.coverUp + 12 && ran.heat >= baitState.heat + 6);
const ver = Actions.chooseOption(baitState, 'verify', fixed(0.5));
ok('verifying the bait costs 10 sparks and builds Investigation', ver.sparks === 40 && ver.investigationProgress >= baitState.investigationProgress + 8);
ok('the bait never fires twice', !SimulationEngine.processTick({ ...ran, notificationQueue: [], currentDay: 5 }, fixed(0.99)).notificationQueue.some(x => x.eventId === 'schemer_honeypot'));
ok('only the Schemer plants it', !SimulationEngine.processTick({ ...believersAt(started('iyaloja_general'), 31), triggeredMilestones: ['MASS_25', 'FIRST_STATE_FLIP', 'HUB_lagos', 'HUB_fct', 'HUB_rivers'], currentDay: 3 }, fixed(0.99)).notificationQueue.some(x => x.eventId === 'schemer_honeypot'));

// ---- Climates ----
ok('10 climates, each with a name, icon and blurb', CLIMATES.length === 10 && CLIMATES.every(c => c.name && c.icon && c.blurb) && new Set(CLIMATES.map(c => c.id)).size === 10);
ok('CLEAR_SKIES has no modifiers and unknown ids fall back safely', describeClimate(getClimate('CLEAR_SKIES')).length === 0 && getClimate('nope').id === 'CLEAR_SKIES');
const climateRun = (id: string) => SimulationEngine.processTick({ ...Actions.plantSeed(Actions.startMatch('iyaloja_general', 'FINANCIAL', null, id), 'kano'), hasPoppedFirstSpark: true, unlockedChannels: ['street_agbero'], states: undefined as any } as any, fixed(0.99));
const cState = (id: string): GameState => { let st = Actions.plantSeed(Actions.startMatch('iyaloja_general', 'FINANCIAL', null, id), 'kano'); st = Actions.collectSpark(st, 'spark_first_kano'); st = Actions.dismissTopAlert(st); return { ...st, unlockedChannels: ['street_agbero', 'press_dialect_fm'], sparks: 100 }; };
ok('Harmattan boosts Street channels', computeMasterVariables(cState('HARMATTAN')).rawVelocity > computeMasterVariables(cState('CLEAR_SKIES')).rawVelocity);
ok('Election Year raises Heat; Fuel Scarcity trims it', heatMultiplier(cState('ELECTION_YEAR')) > heatMultiplier(cState('CLEAR_SKIES')) && heatMultiplier(cState('FUEL_SCARCITY')) < heatMultiplier(cState('CLEAR_SKIES')));
ok('Slow News slows the story going stale; Detty December speeds it', (100 - SimulationEngine.processTick(cState('SLOW_NEWS'), fixed(0.99)).freshness) < (100 - SimulationEngine.processTick(cState('DETTY_DECEMBER'), fixed(0.99)).freshness));
ok('Scandal Season grows the Cover-Up faster', SimulationEngine.processTick(cState('SCANDAL_SEASON'), fixed(0.99)).coverUp > SimulationEngine.processTick(cState('STRIKE_SEASON'), fixed(0.99)).coverUp);
ok('the Ground Zero card names a non-default climate', Actions.collectSpark(Actions.plantSeed(Actions.startMatch('iyaloja_general', 'FINANCIAL', null, 'RAINY_SEASON'), 'kano'), 'spark_first_kano').notificationQueue[0].subtext!.includes('Rainy Season'));
ok('a climate never changes the clean 20-ish-day shape: every climate still plays', CLIMATES.every(c => SimulationEngine.processTick(cState(c.id), fixed(0.5)).currentDay === cState(c.id).currentDay + 1));

// ---- Golden sparks ----
let goldenSeen = 0, fastSeen = 0, fatSeen = 0;
for (let i = 0; i < 400; i++) {
  const st = SimulationEngine.processTick({ ...started(), activeSparks: [] }, mulberry32(i * 31 + 7));
  st.activeSparks.filter(sp => sp.id.startsWith('spark_rng')).forEach(sp => { if (sp.kind === 'GOLDEN') goldenSeen++; else if (sp.kind === 'FAT') fatSeen++; else fastSeen++; });
}
ok('stochastic sparks come in FAST, FAT and rare GOLDEN kinds', goldenSeen > 0 && fatSeen > 0 && fastSeen > 0 && goldenSeen < fastSeen + fatSeen, `${fastSeen}/${fatSeen}/${goldenSeen}`);
const goldenSample = (() => { for (let i = 0; i < 2000; i++) { const st = SimulationEngine.processTick({ ...started(), activeSparks: [] }, mulberry32(i)); const g = st.activeSparks.find(sp => sp.kind === 'GOLDEN'); if (g) return g; } return null; })();
ok('a golden spark pays triple a fat spark and lasts 3 ticks', !!goldenSample && goldenSample.amount >= BALANCE.fatSpark[0] * BALANCE.goldenMultiplier && goldenSample.ticksRemaining === 3);
ok('first-whisper sparks are WHISPER kind', SimulationEngine.processTick(started(), fixed(0.99)).activeSparks.filter(sp => sp.id.startsWith('spark_first')).every(sp => sp.kind === 'WHISPER'));

// ---- Copy variants ----
ok('every alert copy key has at least 3 variants', Object.entries(COPY).every(([, list]) => list.length >= 3), Object.entries(COPY).filter(([, l]) => l.length < 3).map(([k]) => k).join(','));
ok('copy variants differ across seeds but are stable within one', (() => {
  const picks = new Set<string>();
  for (let seed = 0; seed < 40; seed++) picks.add(pickCopy('HEAT_90', seed, { Target: 'X' })!.headline);
  return picks.size >= 3 && pickCopy('HEAT_90', 5, { Target: 'X' })!.headline === pickCopy('HEAT_90', 5, { Target: 'X' })!.headline;
})());
ok('tokens are fully replaced in every variant', Object.keys(COPY).every(k => COPY[k].every(c => !/\{(Hub|HubDesc|Zone|State|Target|Chatter)\}/.test(pickCopy(k, 1, { Hub: 'H', HubDesc: 'D', Zone: 'Z', State: 'S', Target: 'T', Chatter: 'C' })!.body))));
const hv = (seed: number) => AlertFactory.evaluateTickTriggers({ ...started(), heat: 95, copySeed: seed, triggeredMilestones: ['HEAT_40', 'HEAT_70'] })!.alert.headline;
ok('the same milestone reads differently in different runs', new Set([0, 1, 2, 3, 4, 5, 6, 7].map(hv)).size >= 2);
ok('ids and priorities never change with the variant (tests and queue logic depend on them)', [0, 1, 2].every(sd => AlertFactory.evaluateTickTriggers({ ...started(), heat: 95, copySeed: sd, triggeredMilestones: ['HEAT_40', 'HEAT_70'] })!.alert.id === 'heat_90'));
ok('four Ground Zero variants', new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(sd => pickCopy('SEED', sd, { State: 'Kano', Target: 'X' })!.headline)).size === 4);
ok('GIST pools: 3 variants per mood, zone-flavored', Object.values(GIST).every(p => p.length >= 3) && pickGist('EARLY', 'SW', 1, 'lagos') !== pickGist('EARLY', 'NW', 1, 'kano'));
ok('24 tips and 8 taglines', TIPS.length >= 24 && TAGLINES.length >= 8);
ok('24 random events (14 + 10) plus the Schemer bait, and every event (scripted ones too) has a free choice', EVENTS.filter(e => !e.scripted).length === 24 && [...EVENTS, SCHEMER_EVENT].every(e => e.choices('NW').some(c => !c.cost)), EVENTS.filter(e => !e.choices('NW').some(c => !c.cost)).map(e => e.id).join(','));
ok('events read differently across runs', new Set([0, 1, 2, 3, 4, 5].map(sd => buildEventAlert(EVENTS.find(e => e.id === 'fuel_protests')!, { ...started(), copySeed: sd }).body)).size >= 2);

// ---- Daily case ----
ok('the Daily Case is deterministic per date', JSON.stringify(dailyCase('2026-03-14')) === JSON.stringify(dailyCase('2026-03-14')) && dailyCase('2026-03-14').seed !== dailyCase('2026-03-15').seed);
ok('the Daily pool is only Spotlight + Tier 1 (never reveals sealed Targets)', (() => { const ids = new Set<string>(); for (let d = 1; d <= 60; d++) ids.add(dailyCase(`2026-04-${String((d % 28) + 1).padStart(2, '0')}-${d}`).targetId); return [...ids].every(id => DAILY_POOL().includes(id)) && DAILY_POOL().every(id => tgt(id).folder === 'SPOTLIGHT' || tgt(id).folder === 1); })());
ok('a Daily scandal always belongs to its Target', (() => { for (let d = 1; d <= 28; d++) { const c = dailyCase(`2026-05-${String(d).padStart(2, '0')}`); if (!tgt(c.targetId).scandals.some(sd => sd.category === c.category)) return false; } return true; })());
const dc = dailyCase('2026-06-01');
const dailyStart = Actions.startMatch(dc.targetId, dc.category, null, dc.climateId, { seed: dc.seed, dailyKey: dc.dateKey });
ok('a daily match is flagged, seeded and perk-free', dailyStart.dailyKey === '2026-06-01' && dailyStart.seed === dc.seed && dailyStart.perkId === null && dailyStart.copySeed === dc.seed);
const dPlay = (st: GameState) => { let x = Actions.plantSeed(st, 'kano'); x = Actions.collectSpark(x, 'spark_first_kano'); return { ...Actions.dismissTopAlert(x), sparks: 100 }; };
const runDaily = () => { let st = dPlay(dailyStart); for (let i = 0; i < 6; i++) { st = SimulationEngine.processTick(st); st = { ...st, notificationQueue: [] }; } return JSON.stringify([st.heat, st.coverUp, Object.values(st.states).map(x => x.heard), st.activeSparks.map(sp => sp.amount)]); };
ok('a daily case rolls the same dice for everyone', runDaily() === runDaily());
ok('every match is seeded (so any win can be challenged), but only dailies carry a date', typeof fresh('iyaloja_general').seed === 'number' && fresh('iyaloja_general').dailyKey === null && fresh('iyaloja_general').challenge === null);
ok('daily streaks count consecutive days only', dailyStreak(['2026-06-01', '2026-06-02', '2026-06-03'], '2026-06-03') === 3 && dailyStreak(['2026-06-01', '2026-06-03'], '2026-06-03') === 1 && dailyStreak(['2026-06-01'], '2026-06-05') === 0 && dailyStreak(['2026-05-31', '2026-06-01'], '2026-06-02') === 2);
ok('daily bonus is 25 and grows 5 per streak day, capped', dailyBonus(0) === 25 && dailyBonus(3) === 40 && dailyBonus(50) === 25 + 5 * 6);
const dayWin = (key: string | null): GameState => ({ ...started('iyaloja_general'), status: 'WON' as const, currentDay: 30, dailyKey: key });
const dw1 = applyWin(emptyProfile(), dayWin('2026-06-01'), 80)!;
ok('a daily win pays the daily bonus once', dw1.rewards.breakdown.some(b => b.label.startsWith('Daily Case')) && dw1.profile.dailyWins.includes('2026-06-01'));
const dw2 = applyWin(dw1.profile, dayWin('2026-06-01'), 80)!;
ok('replaying the same daily does not pay again', !dw2.rewards.breakdown.some(b => b.label.startsWith('Daily Case')));
const dw3 = applyWin({ ...dw1.profile }, dayWin('2026-06-02'), 80)!;
ok('a streak raises the next daily bonus', dw3.rewards.breakdown.find(b => b.label.startsWith('Daily Case'))!.amount === 30);
ok('a normal win never pays a daily bonus', !applyWin(emptyProfile(), dayWin(null), 80)!.rewards.breakdown.some(b => b.label.startsWith('Daily Case')));

// ---- Share card ----
const shareWin = shareText({ ...started('iyaloja_general'), status: 'WON' as const, currentDay: 20, peakHeat: 40, peakCoverUp: 30 }, 3);
ok('the share text is a compact, emoji result card', shareWin.includes('★★★') && shareWin.includes('Day 20/36') && shareWin.split('\n').length >= 5 && shareWin.length < 400, shareWin);

// ---- Mood theming ----
ok('mood escalates with Heat', moodOf({ ...started(), heat: 10 }).key === 'CALM' && moodOf({ ...started(), heat: 45 }).key === 'WARM' && moodOf({ ...started(), heat: 75 }).key === 'HOT' && moodOf({ ...started(), heat: 95 }).key === 'CRITICAL' && moodOf({ ...started(), heat: 95 }).pulse);
ok('a stale story drains colour; a fresh one does not', moodOf({ ...started(), freshness: 10 }).filter !== 'none' && moodOf({ ...started(), freshness: 90 }).filter === 'none');
ok('frozen channels bring the frost; belief brings the glow', moodOf({ ...started(), frozenChannels: { street_agbero: 99 } }).frost && !moodOf(started()).frost && moodOf(believersAt(started(), 55)).glow !== null && moodOf(started()).glow === null);
ok('the map tint moves across the match and stays a valid colour', /^#[0-9a-f]{6}$/i.test(dayTint(0)) && /^#[0-9a-f]{6}$/i.test(dayTint(1)) && dayTint(0) !== dayTint(1));

// ---- Robustness: sanitizer ----
const mock: Record<string, string> = {};
(globalThis as any).localStorage = { getItem: (k: string) => mock[k] ?? null, setItem: (k: string, v: string) => { mock[k] = v; }, removeItem: (k: string) => { delete mock[k]; } };
const corrupt: GameState = { ...started('iyaloja_general') };
corrupt.heat = NaN as any; corrupt.sparks = -50; corrupt.coverUp = 400; corrupt.freshness = undefined as any;
corrupt.states = { ...corrupt.states, kano: { ...corrupt.states['kano'], heard: -5, believers: 9e12, doubt: 300 } };
const healed = sanitizeState(corrupt);
ok('sanitizeState repairs corrupt numbers', checkInvariants(healed).length === 0 && healed.heat === 0 && healed.sparks === 0 && healed.coverUp === 100 && healed.freshness === 100, checkInvariants(healed).join(' | '));
const staleCard: GameState = { ...started(), notificationQueue: [{ id: 'x', archetype: 'INFORMANT_TIP', stampText: 's', headline: 'h', body: 'b', buttonText: 'ok', priority: 45, eventId: 'event_that_was_deleted', choices: [{ id: 'a', label: 'A' }] }] };
ok('an unanswerable decision card is dropped on load', sanitizeState(staleCard).notificationQueue.length === 0);
ok('a stale card in a live game is also dropped when answered (no soft-lock)', Actions.chooseOption(staleCard, 'a').notificationQueue.length === 0);
ok('a wrong ability schedule is realigned with the Target', sanitizeState({ ...started('minister'), abilityNext: [] }).abilityNext.length === tgt('minister').abilities.length);
mock['rumor_game_save_v9'] = JSON.stringify({ ...started(), heat: NaN });
ok('SaveManager.load survives a corrupt save', checkInvariants(SaveManager.load()).length === 0);
mock['rumor_game_save_v9'] = '{not json';
ok('SaveManager.load survives garbage', SaveManager.load().status === 'LOBBY');
mock['rumor_game_save_v9'] = JSON.stringify(started('iyaloja_general'));
ok('a healthy save round-trips', SaveManager.load().activeTargetId === 'iyaloja_general');

// ---- Robustness: fuzz. Random whole games; no crash, invariants hold, and the player can always move on. ----
const canUnstick = (st: GameState): boolean => {
  if (st.status !== 'PLAYING') return true;
  let x = st;
  for (let i = 0; i < 12; i++) {
    if (canTick(x)) return true;
    const top = x.notificationQueue[0];
    if (top) {
      if (top.choices && top.choices.length > 0) {
        const free = top.choices.find(c => !c.cost || c.cost <= x.sparks);
        if (!free) return false;
        x = Actions.chooseOption(x, free.id, fixed(0.5));
      } else x = Actions.dismissTopAlert(x);
    } else if (x.activeModal !== 'NONE') x = Actions.setModal(x, 'NONE');
    else if (x.isPaused) x = Actions.resume(x);
    else return false;
  }
  return canTick(x);
};
const fuzzStats = { games: 0, steps: 0, ticks: 0, ended: { WON: 0, LOST_HEAT: 0, LOST_TIME: 0, LOST_COVERUP: 0, PLAYING: 0 } as Record<string, number>, events: 0, choices: 0, abilities: 0 };
const fuzzOne = (seed: number): string | null => {
  const rng = mulberry32(seed);
  const target = TARGETS[Math.floor(rng() * TARGETS.length)];
  const cat = target.scandals[Math.floor(rng() * 3)].category;
  const perk = rng() < 0.4 ? ['motor_park_boss', 'burner_rig', 'press_club', 'secretariat_mole', 'bailiff_friend', 'fact_check_immunity'][Math.floor(rng() * 6)] : null;
  let st = Actions.startMatch(target.id, cat, perk, CLIMATES[Math.floor(rng() * CLIMATES.length)].id, rng() < 0.2 ? { seed: seed * 13, dailyKey: '2026-01-01' } : {});
  st = Actions.plantSeed(st, Object.keys(st.states)[Math.floor(rng() * 37)]);
  const seedId = st.activeSparks[0].id;
  st = Actions.collectSpark(st, seedId);
  const check = (where: string): string | null => {
    const bad = checkInvariants(st);
    return bad.length ? `seed ${seed} ${target.id} ${where}: ${bad[0]}` : null;
  };
  for (let step = 0; step < 90 && st.status === 'PLAYING'; step++) {
    const roll = rng();
    try {
      if (roll < 0.2) st = Actions.buyChannel(st, CHANNELS_DATA[Math.floor(rng() * CHANNELS_DATA.length)].id);
      else if (roll < 0.3) st = Actions.leakEvidence(st, EVIDENCE_DATA[Math.floor(rng() * EVIDENCE_DATA.length)].id, rng);
      else if (roll < 0.4) st = Actions.buyDefense(st, ['burner_sim', 'proxy_relay', 'san_injunction', 'whistleblower', 'safehouse'][Math.floor(rng() * 5)]);
      else if (roll < 0.5 && st.activeSparks.length) st = Actions.collectSpark(st, st.activeSparks[Math.floor(rng() * st.activeSparks.length)].id);
      else if (roll < 0.57 && st.activeSpinBubbles.length) st = Actions.popSpin(st, st.activeSpinBubbles[0].id);
      else if (roll < 0.62) st = Actions.setModal(st, (['CHANNELS_DESK', 'EVIDENCE_DESK', 'COUNTER_OPS_DESK', 'HEAT_INFO', 'NONE', 'TARGET_INFO'] as const)[Math.floor(rng() * 6)]);
      else if (roll < 0.66) st = Actions.pause(st);
      else if (roll < 0.7) st = Actions.resume(st);
      else if (roll < 0.76 && st.notificationQueue.length) {
        const top = st.notificationQueue[0];
        st = top.choices?.length ? Actions.chooseOption(st, top.choices[Math.floor(rng() * top.choices.length)].id, rng) : Actions.dismissTopAlert(st);
      } else if (roll < 0.8) st = Actions.selectState(st, rng() < 0.3 ? null : Object.keys(st.states)[Math.floor(rng() * 37)]);
      else {
        if (!canUnstick(st)) return `seed ${seed} ${target.id}: player trapped at step ${step} (queue ${st.notificationQueue.map(a => a.id)}, modal ${st.activeModal}, paused ${st.isPaused})`;
        let x = st;
        for (let i = 0; i < 12 && !canTick(x) && x.status === 'PLAYING'; i++) {
          const top = x.notificationQueue[0];
          if (top) x = top.choices?.length ? Actions.chooseOption(x, (top.choices.find(c => !c.cost || c.cost <= x.sparks) ?? top.choices[0]).id, rng) : Actions.dismissTopAlert(x);
          else if (x.activeModal !== 'NONE') x = Actions.setModal(x, 'NONE');
          else if (x.isPaused) x = Actions.resume(x);
        }
        st = SimulationEngine.processTick(x, rng);
      }
    } catch (e) {
      return `seed ${seed} ${target.id} threw at step ${step}: ${(e as Error).message}`;
    }
    fuzzStats.steps++;
    if (st.notificationQueue[0]?.choices) fuzzStats.choices++;
    const v = check(`step ${step}`);
    if (v) return v;
  }
  fuzzStats.games++;
  fuzzStats.ended[st.status] = (fuzzStats.ended[st.status] ?? 0) + 1;
  fuzzStats.ticks += st.currentDay - 1;
  fuzzStats.abilities += st.abilityNext.filter((n, i) => n > tgt(st.activeTargetId!).abilities[i].start).length;
  fuzzStats.events += st.usedEvents.length;
  return null;
};
const fuzzFailures: string[] = [];
for (let i = 0; i < 400; i++) { const r = fuzzOne(1000 + i); if (r) fuzzFailures.push(r); }
console.log('fuzz stats', JSON.stringify(fuzzStats));
ok('FUZZ really plays: thousands of steps, hundreds of ticks, events and abilities fire, games end every way', fuzzStats.steps > 8000 && fuzzStats.ticks > 1500 && fuzzStats.events > 100 && fuzzStats.abilities > 100 && fuzzStats.ended.WON + fuzzStats.ended.LOST_HEAT + fuzzStats.ended.LOST_TIME + fuzzStats.ended.LOST_COVERUP > 20, JSON.stringify(fuzzStats));
ok('FUZZ: 400 random games, every target: no crash, all invariants hold, the player is never trapped', fuzzFailures.length === 0, fuzzFailures.slice(0, 3).join(' || '));

// every Target, every scandal, every climate can start and tick without error
let startFailures = 0;
TARGETS.forEach(t => t.scandals.forEach(sd => { try { const x = dPlay(Actions.startMatch(t.id, sd.category, null, CLIMATES[(t.prRating >> 3) % CLIMATES.length].id)); const y = SimulationEngine.processTick(x, fixed(0.4)); if (checkInvariants(y).length) startFailures++; } catch { startFailures++; } }));
ok('all 61 Targets x 3 scandals start and tick cleanly', startFailures === 0, String(startFailures));

// ---------------------------------------------------------------------------
// Target packs, Story Mode, settings
// ---------------------------------------------------------------------------
const packCheck = validatePack(STORY_PACK, builtInIds());
ok('the Story Mode cast is a valid pack with no errors', packCheck.errors.length === 0, packCheck.errors.slice(0, 4).join(' | '));
ok('every Story Target registered and is hidden from the Dossier folders', STORY_PACK.targets.every(d => TARGETS.some(x => x.id === d.id && x.storyOnly)) && TARGETS.filter(x => x.storyOnly).every(x => ![1, 2, 3, 4, 5, 'SPOTLIGHT'].some(fo => targetsInFolder(fo as never).includes(x))));
ok('every chapter points at registered Targets and has a motive, a win and a loss epilogue', STORY_CHAPTERS.every(c => c.variants.every(vr => TARGETS.some(x => x.id === vr.targetId && x.scandals.length >= 1) && vr.motive.length >= 2 && vr.win.length >= 1 && vr.lose.length > 0)));
ok('story pairs: ex, cheater and ex-spouse each offer two Targets', STORY_CHAPTERS.filter(c => c.variants.length === 2).length === 3);
ok('the full cast spans the requested relationships', ['story_ex_boyfriend', 'story_ex_girlfriend', 'story_cheating_girlfriend', 'story_cheating_boyfriend', 'story_ex_husband', 'story_ex_wife', 'story_colleague', 'story_former_bestie', 'story_boss', 'story_rival', 'story_uncle', 'story_fixer', 'story_client', 'story_mentor'].every(id => TARGETS.some(x => x.id === id)));
const planIds = Object.values(PLAN).flatMap(p => p.order);
ok('the difficulty plan lists every built-in Target exactly once', new Set(planIds).size === planIds.length && TARGETS.filter(x => !x.storyOnly).every(x => planIds.includes(x.id)) && planIds.every(id => TARGETS.some(x => x.id === id)));
ok('PR ratings rise with difficulty inside every tier (the plan order)', Object.values(PLAN).every(p => p.order.every((id, i) => i === 0 || getTarget(id).prRating > getTarget(p.order[i - 1]).prRating)));
ok('every tier keeps to its rating range and no tier overlaps the next', [1, 2, 3, 4, 5].every(t => PLAN[t].order.every(id => getTarget(id).prRating >= RATING_RANGES[t][0] && getTarget(id).prRating <= RATING_RANGES[t][1])) && [1, 2, 3, 4].every(t => Math.max(...PLAN[t].order.map(id => getTarget(id).prRating)) < Math.min(...PLAN[t + 1].order.map(id => getTarget(id).prRating))));
ok('every built-in Target has a play style hint for the dossier', TARGETS.filter(x => !x.storyOnly).every(x => (playStyleOf(x)?.hints.length ?? 0) > 0));
ok('every built-in Target has a portrait Look (gender, age, region)', TARGETS.filter(x => !x.id.startsWith('verify_')).every(x => !!LOOKS[x.id] && !!LOOKS[x.id].g && !!LOOKS[x.id].age && !!LOOKS[x.id].region), TARGETS.filter(x => !LOOKS[x.id]).map(x => x.id).join(','));

// ---- state names on the map and the state list
{
  const VW = 400, VH = 420;   // a phone-sized map area
  const view = (scale: number, tx = 0, ty = 0, forced: string[] = []) => layoutLabels({ viewW: VW, viewH: VH, scale, tx, ty, forced });
  const full = new Set(ALL_STATE_IDS.map(stateLabel));
  const normal = view(1);
  ok('state names are written in full, never as codes (every label is a real state name)', normal.every(l => full.has(l.lines.join(' '))), normal.map(l => l.lines.join(' ')).join(','));
  ok('at normal zoom the famous states are named (Lagos, Abuja, Kano, Rivers)', ['lagos', 'fct', 'kano', 'rivers'].every(id => normal.some(l => l.id === id)));
  ok('at normal zoom at least 18 of the 37 states are named', normal.length >= 18, String(normal.length));
  ok('zooming in names more states: "Find a state" on Abia shows every state around it by name', view(1.5).length > normal.length && (() => { const f = focusTransform('abia', VW, VH); const l = layoutLabels({ viewW: VW, viewH: VH, scale: f.scale, tx: f.x, ty: f.y }); return ['imo', 'abia', 'anambra', 'ebonyi', 'enugu', 'rivers', 'akwa_ibom'].every(id => l.some(x => x.id === id)); })());
  const overlap = (l: ReturnType<typeof view>) => l.some((a, i) => l.slice(i + 1).some(b => {
    const wa = Math.max(...a.lines.map(x => x.length)) * a.fontUnits * 0.62, wb = Math.max(...b.lines.map(x => x.length)) * b.fontUnits * 0.62;
    const ha = a.lines.length * a.fontUnits * 1.15, hb = b.lines.length * b.fontUnits * 1.15;
    return Math.abs(a.x - b.x) < (wa + wb) / 2 * 0.999 && Math.abs(a.y - b.y) < (ha + hb) / 2 * 0.999;
  }));
  ok('state names never overlap each other (at four zoom levels)', [1, 1.5, 2.5, 4].every(z => !overlap(view(z))));
  const k = Math.min(Math.min(VW * 0.94, 640) / 744, Math.min(VH * 0.94, 520) / 600);
  ok('state names never run off the edge of the map', [1, 2].every(z => view(z).every(l => {
    const w = Math.max(...l.lines.map(x => x.length)) * l.fontUnits * 0.62 / 2; return l.x - w >= -1 && l.x + w <= 745;
  })), '');
  ok('a state that must be shown (selected or searched) is always named', view(1, 0, 0, ['ebonyi', 'abia']).filter(l => l.forced).length === 2);
  ok('the list has every state exactly once, A to Z and by region', STATES_A_TO_Z.length === ALL_STATE_IDS.length && new Set(STATES_A_TO_Z).size === ALL_STATE_IDS.length && STATES_BY_ZONE.reduce((n, z) => n + z.ids.length, 0) === ALL_STATE_IDS.length);
  const f = focusTransform('abia', VW, VH);
  ok('"Find a state" zooms in on the state it was asked for', f.scale >= 2 && Number.isFinite(f.x) && Number.isFinite(f.y));
  ok('the first-case plan: a brand-new case plants a seed in the state the player chose', (() => { const s = Actions.plantSeed(Actions.startMatch('slay_queen', 'AFFAIR', null, 'CLEAR_SKIES', { seed: 7, training: true }), 'enugu'); return s.hasPlantedSeed && s.startingStateId === 'enugu' && s.training; })());
}
ok('Story Targets use the comic voice (never arrests)', STORY_PACK.targets.every(d => TARGETS.find(x => x.id === d.id)!.parody));
// validation catches what it should
const blank = newBlankDef();
ok('a blank Target from the Studio is valid', validateTargetDef(blank, { builtInIds: builtInIds() }).errors.length === 0, validateTargetDef(blank).errors.join('|'));
const bad = (patch: Partial<TargetDef>) => validateTargetDef({ ...blank, ...patch } as TargetDef, { builtInIds: builtInIds() }).errors.length > 0;
ok('validation rejects: bad id, built-in id clash, bad tier, no scandals, same weak/resist lane, huge ability, creator without consent', bad({ id: 'Bad Id' }) && bad({ id: 'godfather' }) && bad({ tier: 9 as never }) && bad({ scandals: [] }) && bad({ ai: { ...blank.ai, weaknessBranch: 'PRESS', resistanceBranch: 'PRESS' } }) && bad({ abilities: [{ ...blank.abilities[0], strength: 99 }] }) && bad({ kind: 'CREATOR' }));
ok('a CREATOR needs permission on record and may only have comic scandals', !bad({ kind: 'CREATOR', creator: { handle: '@x', consentRef: 'email 2026-01-02', approvedOn: '2026-01-02' }, scandals: [{ category: 'LEAKED_MEDIA', title: 'Forgot to Mute During a Live' }] }) && bad({ kind: 'CREATOR', creator: { handle: '@x', consentRef: 'email', approvedOn: '2026-01-02' }, scandals: [{ category: 'FINANCIAL', title: 'Stole billions from fans' }] }));
ok('a fictional name that matches a real person is refused', bad({ fullName: 'Aliko Dangote' }));
ok('avatar images must be https or a raster data URL (no SVG, no http)', bad({ avatar: { silhouette: 'suit', imageUrl: 'http://x.com/a.png' } }) && bad({ avatar: { silhouette: 'suit', imageUrl: 'data:image/svg+xml;base64,AAAA' } }) && !bad({ avatar: { silhouette: 'suit', imageUrl: 'https://x.com/a.png', accent: '#112233' } }));
// registering a pack adds playable Targets; unregistering removes them; a bad Target never blocks a good one
const testPack: TargetPack = { schema: PACK_SCHEMA_VERSION, packId: 'verify-pack', name: 'Verify', author: 't', version: 1, targets: [{ ...blank, id: 'verify_one' }, { ...blank, id: 'verify_bad', tier: 9 as never }, { ...blank, id: 'verify_off', enabled: false }] };
const rep = registerPack(testPack);
ok('registerPack adds valid enabled Targets, skips invalid/disabled ones, and reports', rep.registered.join() === 'verify_one' && rep.skipped.includes('verify_bad') && rep.skipped.includes('verify_off') && !rep.ok);
ok('a pack Target can be played end to end', (() => { const s0 = Actions.startMatch('verify_one', 'FINANCIAL'); let s1 = SimulationEngine.processTick(s0, fixed(0.4)); s1 = SimulationEngine.processTick(s1, fixed(0.4)); return checkInvariants(s1).length === 0; })());
unregisterPack('verify-pack');
ok('unregisterPack removes the Targets again', !TARGETS.some(x => x.id.startsWith('verify_')));
ok('an id owned by built-in content can never be overwritten by a pack', registerPack({ ...testPack, packId: 'verify-pack-2', targets: [{ ...blank, id: 'godfather' }] }).registered.length === 0 && TARGETS.filter(x => x.id === 'godfather').length === 1);
ok('the estimated rating sits inside the tier range', estimateRating(blank) >= RATING_RANGES[1][0] && estimateRating(blank) <= RATING_RANGES[1][1]);

// story rules
ok('story approaches and reputation are encoded in the perk id and resolve to effects', parseStoryPerk(storyPerkId('truth', 'high'))?.approach === 'truth' && perkEffects(storyPerkId('truth', 'high')).doubtDelta === -5 && perkEffects(storyPerkId('whatever', 'low')).startSparks === 30 && perkEffects(storyPerkId('mercy', 'mid')).heatMult === 0.8);
const storyStart = (approach: 'truth' | 'whatever' | 'mercy', integrity = 0) => Actions.startMatch('story_ex_boyfriend', 'FINANCIAL', perkIdFor({ ...emptyStory(), integrity }, approach), 'CLEAR_SKIES', { storyId: 'c01' });
const firstDoubt = (s: GameState) => Object.values(s.states)[0].doubt;
ok('Whatever Works starts with extra sparks; Receipts Only starts with investigation and less Doubt', storyStart('whatever').sparks === 30 && storyStart('truth').investigationProgress === 30 && firstDoubt(storyStart('truth')) < firstDoubt(Actions.startMatch('story_ex_boyfriend', 'FINANCIAL')));
ok('low reputation makes everyone start with more Doubt', firstDoubt(storyStart('truth', -5)) > firstDoubt(storyStart('truth', 0)));
const wonStory = (approach: 'truth' | 'whatever' | 'mercy', backfires = 0): GameState => ({ ...storyStart(approach), status: 'WON', currentDay: 8, backfires });
const profS = emptyProfile();
const wonT = wonStory('truth');
const sr1 = recordChapter(profS, wonT);
ok('winning a chapter unlocks the next, scores reputation by approach', chapterUnlocked(sr1.story, 1) && !chapterUnlocked(profS.story, 1) && sr1.story.integrity === 2 && sr1.story.results['c01'].won);
ok('the same match is never recorded twice', JSON.stringify(recordChapter(sr1, wonT)) === JSON.stringify(sr1));
const sr2 = recordChapter(sr1, { ...wonStory('whatever'), copySeed: 12345 });
ok('replaying a won chapter changes stars at most, never reputation', sr2.story.integrity === 2);
ok('Whatever Works costs reputation; exposed forgeries cost more', recordChapter(profS, wonStory('whatever')).story.integrity === -2 && recordChapter(profS, wonStory('whatever', 3)).story.integrity === -4);
const sLoss = recordChapter(profS, { ...storyStart('truth'), status: 'LOST_HEAT' });
ok('a defeat costs nothing but an attempt and does not unlock', !chapterUnlocked(sLoss.story, 1) && sLoss.story.integrity === 0 && sLoss.story.results['c01'].attempts === 1);
ok('reputation bands and the three season endings', repBand(-3) === 'low' && repBand(0) === 'mid' && repBand(3) === 'high' && new Set([seasonEnding(6).id, seasonEnding(0).id, seasonEnding(-6).id]).size === 3);
ok('imported story progress is sanitised', (() => { const s = sanitizeStory({ integrity: 999, picks: { c01: 'nope', c02: 'story_cheating_boyfriend' }, results: { c01: { targetId: 'nope' }, c02: { targetId: 'story_cheating_boyfriend', won: true, stars: 99 } } }); return s.integrity === 12 && !s.picks.c01 && s.picks.c02 === 'story_cheating_boyfriend' && !s.results.c01 && s.results.c02.stars === 3; })());
ok('a full season of wins completes the story', (() => { let p = emptyProfile(); STORY_CHAPTERS.forEach(c => { const tid = c.variants[0].targetId; p = recordChapter(p, { ...Actions.startMatch(tid, 'FINANCIAL', perkIdFor(p.story, 'truth'), 'CLEAR_SKIES', { storyId: c.id }), status: 'WON', currentDay: 8 }); }); return seasonComplete(p.story); })());
ok('all three approaches exist with a reputation effect', APPROACHES.length === 3 && APPROACHES.some(a => a.integrity < 0) && APPROACHES.some(a => a.integrity > 0));

// ---------------------------------------------------------------------------
// Music library and director
// ---------------------------------------------------------------------------
ok('the music library has 15+ tracks across calm, lo-fi, afro-soul, amapiano, afrobeats, highlife, street, drill, tense, victory and defeat', TRACKS_M.length >= 15 && ['calm', 'lofi', 'afrosoul', 'amapiano', 'afrobeats', 'highlife', 'street', 'drill', 'tense', 'victory', 'defeat'].every(g => TRACKS_M.some(t => t.genre === g)));
ok('every track is valid (16-step patterns, bpm, progression, layers)', TRACKS_M.every(t => validateTrack(t).length === 0), TRACKS_M.filter(t => validateTrack(t).length).map(t => t.id + ':' + validateTrack(t).join(',')).join(' | '));
ok('track ids are unique', new Set(TRACKS_M.map(t => t.id)).size === TRACKS_M.length);
ok('every mood has at least one track, and every station has a calm option, and the active stations have medium or high energy options', (['calm', 'chill', 'medium', 'high', 'tense', 'triumph', 'sad'] as const).every(m => TRACKS_M.some(t => t.mood === m)) && (['afrobeats', 'amapiano', 'chill', 'street'] as const).every(st => TRACKS_M.some(t => t.stations.includes(st) && ['chill', 'calm'].includes(t.mood))) && (['afrobeats', 'amapiano', 'street'] as const).every(st => TRACKS_M.some(t => t.stations.includes(st) && ['medium', 'high'].includes(t.mood))));
ok('melodies are deterministic and stay in the scale range', TRACKS_M.filter(t => t.lead).every(t => JSON.stringify(melodyForBar(t, 0)) === JSON.stringify(melodyForBar(t, 0)) && melodyForBar(t, 3).every(m => m.step >= 0 && m.step < 16 && noteFromDegree(t, m.degree) > 40 && noteFromDegree(t, m.degree) < 110)));
const dirOK = (c: Parameters<typeof chooseTrack>[0], style: Parameters<typeof chooseTrack>[1] = 'auto', salt = 0) => chooseTrack(c, style, salt);
ok('director: Dossier is calm or chill; before the first spark it is quiet', ['calm', 'chill'].includes(getTrackM(dirOK({ screen: 'dossier' }).trackId)!.mood) && dirOK({ screen: 'live', started: false }).trackId === 'harmattan_morning');
ok('director: danger and critical heat move to tense music; victory and defeat have their own songs', dirOK({ screen: 'live', started: true, heat: 75, tier: 2 }).reason === 'danger' && dirOK({ screen: 'live', started: true, heat: 90 }).trackId === 'safehouse_critical' && dirOK({ screen: 'live', started: true, coverUp: 95 }).trackId === 'safehouse_critical' && dirOK({ screen: 'end', won: true }).trackId === 'front_page_glory' && dirOK({ screen: 'end', won: false }).trackId === 'dead_air');
ok('director: strong belief gives a high-energy song; late and behind gives tension', getTrackM(dirOK({ screen: 'live', started: true, believers: 60, heat: 10, tier: 2 }).trackId)!.mood === 'high' && getTrackM(dirOK({ screen: 'live', started: true, believers: 20, dayFrac: 0.9, heat: 10 }).trackId)!.mood === 'tense');
ok('director: harder tiers sound harder (tier 5 is street or tense, tier 1 is not)', ['street', 'drill', 'tense'].includes(getTrackM(dirOK({ screen: 'live', started: true, tier: 5, believers: 10, heat: 10 }, 'auto', 1).trackId)!.genre) && !['drill', 'tense'].includes(getTrackM(dirOK({ screen: 'live', started: true, tier: 1, believers: 10, heat: 10 }, 'auto', 1).trackId)!.genre));
ok('director: a chosen station keeps the soundtrack on that genre', [0, 1, 2, 3, 4, 5].every(s => getTrackM(dirOK({ screen: 'live', started: true, tier: 2, believers: 10, heat: 10 }, 'amapiano', s).trackId)!.stations.includes('amapiano')) && [0, 1, 2, 3].every(s => getTrackM(dirOK({ screen: 'dossier' }, 'chill', s).trackId)!.stations.includes('chill')));
ok('director: different cases can hear different songs in the same situation', new Set([0, 1, 2, 3, 4, 5, 6, 7].map(s => dirOK({ screen: 'live', started: true, tier: 3, believers: 10, heat: 10 }, 'auto', s).trackId)).size >= 2);
ok('director: always returns a real track, for every combination of state', (() => { for (const screen of ['dossier', 'story', 'live', 'end'] as const) for (const heat of [0, 50, 72, 88, 100]) for (const believers of [0, 30, 60, 80]) for (const tier of [1, 2, 3, 4, 5]) for (const climateId of [undefined, 'RAINY_SEASON', 'DETTY_DECEMBER', 'HARMATTAN', 'ELECTION_YEAR', 'BLACKOUT_WEEK']) for (const style of ['auto', 'afrobeats', 'amapiano', 'chill', 'street'] as const) for (const salt of [0, 1, 7, 123456]) { const p = chooseTrack({ screen, started: true, heat, believers, tier, climateId, dayFrac: 0.5, won: believers > 50, storyAct: 2 }, style, salt); if (!getTrackM(p.trackId)) return false; } return true; })());
ok('energy rises with belief, heat and time, and stays between 0 and 1', energyFor({ screen: 'live', started: true, believers: 0, heat: 0, tier: 1, dayFrac: 0 }) < energyFor({ screen: 'live', started: true, believers: 50, heat: 0, tier: 1, dayFrac: 0 }) && energyFor({ screen: 'live', started: true, believers: 50, heat: 20, tier: 1, dayFrac: 0 }) < energyFor({ screen: 'live', started: true, believers: 50, heat: 80, tier: 3, dayFrac: 0.8 }) && energyFor({ screen: 'live', started: true, believers: 100, heat: 100, tier: 5, dayFrac: 1 }) <= 1);
ok('the music style setting is sanitised', sanitizeSettings({ musicStyle: 'amapiano' }).musicStyle === 'amapiano' && sanitizeSettings({ musicStyle: 'polka' }).musicStyle === 'auto');

// ---------------------------------------------------------------------------
// Offline leaderboards and challenges
// ---------------------------------------------------------------------------
const wonCase = (over: Partial<GameState> = {}): GameState => ({ ...Actions.startMatch('iyaloja_general', 'FINANCIAL', null, 'CLEAR_SKIES', { seed: 4242 }), status: 'WON', currentDay: 12, peakHeat: 40, backfires: 0, ...over });
const eA = makeEntry(wonCase(), 3, { pid: 'p1', name: 'Tunde', crew: 'Lagos' });
ok('a score is higher for faster, cooler, cleaner wins, and assisted counts half', computeScore(wonCase({ currentDay: 8 }), 3) > computeScore(wonCase({ currentDay: 20 }), 3) && computeScore(wonCase({ peakHeat: 10 }), 3) > computeScore(wonCase({ peakHeat: 90 }), 3) && computeScore(wonCase({ backfires: 2 }), 3) < computeScore(wonCase(), 3) && computeScore(wonCase({ assisted: true }), 3) * 2 <= computeScore(wonCase(), 3) + 1 && computeScore({ ...wonCase(), status: 'LOST_HEAT' }, 0) === 0);
ok('a signed score round-trips through its code and its link', decodeScores(encodeEntry(eA)).length === 1 && decodeScores(encodeEntry(eA))[0].score === eA.score && decodeScores('https://x.test/?s=' + encodeEntry(eA)).length === 1);
ok('a tampered score is rejected (changed score, changed name, garbage, wrong prefix)', (() => { const forged = { ...eA, score: 9999 }; const code = 'RUM1.' + Buffer.from(JSON.stringify(forged)).toString('base64url'); const renamed = 'RUM1.' + Buffer.from(JSON.stringify({ ...eA, name: 'Evil' })).toString('base64url'); return decodeScores(code).length === 0 && decodeScores(renamed).length === 0 && decodeScores('RUM1.@@@').length === 0 && decodeScores('hello').length === 0 && decodeScores('').length === 0; })());
ok('names are cleaned of markup and capped', makeEntry(wonCase(), 3, { pid: 'p', name: '<b>Tunde</b>' + 'x'.repeat(40), crew: 'a'.repeat(50) }).name.length <= 20 && !/[<>]/.test(makeEntry(wonCase(), 3, { pid: 'p', name: '<b>x', crew: '' }).name));
const mkE = (pid: string, name: string, crew: string, day: number, key = '2026-06-01') => makeEntry(wonCase({ currentDay: day, dailyKey: key }), 3, { pid, name, crew });
const boardEntries = [mkE('a', 'Ada', 'Lagos', 8), mkE('b', 'Bayo', 'Lagos', 14), mkE('c', 'Chi', 'Abuja', 10), mkE('a', 'Ada', 'Lagos', 20)];
const dB = dailyBoard(boardEntries, '2026-06-01');
ok('the daily board ranks best first, one line per player, and ignores other days', dB.length === 3 && dB[0].entry.name === 'Ada' && dB[0].rank === 1 && dB.every((r, i) => i === 0 || dB[i - 1].entry.score >= r.entry.score) && dailyBoard(boardEntries, '2026-06-02').length === 0);
ok('crews rank by the average of their best players, not by size', (() => { const rows = crewBoard([...boardEntries, mkE('d', 'Dee', 'Lagos', 18)]); return rows.length === 2 && rows.every(r => r.score > 0) && rows.find(r => r.crew === 'Lagos')!.players === 3; })());
ok('a board code carries many scores and rejects a forged one among them', (() => { const code = encodeBoard(boardEntries); const forged = JSON.parse(Buffer.from(code.slice(5), 'base64url').toString()); forged[0].score = 9000; const bad = 'RUMB.' + Buffer.from(JSON.stringify(forged)).toString('base64url'); return decodeScores(code).length === 4 && decodeScores(bad).length === 3; })());
const chA = makeChallenge(wonCase(), 3, 'Dayo')!;
ok('a challenge round-trips with its case intact, and a changed seed or score is rejected', (() => { const code = encodeChallenge(chA); const d = decodeChallenge('https://x.test/?c=' + code); const tampered = { ...chA, s: 1 }; const bad = 'RUMC.' + Buffer.from(JSON.stringify(tampered)).toString('base64url'); return !!d && d.t === 'iyaloja_general' && d.s === 4242 && d.sc === chA.sc && decodeChallenge(bad) === null && decodeChallenge('RUMC.xx') === null && decodeChallenge('nope') === null; })());
ok('a challenge for a Target that does not exist, or a scandal it does not have, is rejected', (() => { const bad1 = { ...chA, t: 'nobody' }; const bad2 = { ...chA, k: 'AFFAIR' as const }; const enc = (o: object) => 'RUMC.' + Buffer.from(JSON.stringify(o)).toString('base64url'); return decodeChallenge(enc(bad1)) === null && decodeChallenge(enc(bad2)) === null; })());
ok('only real, seeded wins can become challenges (not training, not losses)', makeChallenge({ ...wonCase(), training: true }, 3, 'x') === null && makeChallenge({ ...wonCase(), status: 'LOST_HEAT' }, 0, 'x') === null);
ok('a challenge match is perk-free and carries the score to beat', (() => { const s = Actions.startMatch(chA.t, chA.k, null, chA.c, { seed: chA.s, challenge: { id: challengeId(chA), by: chA.by, score: chA.sc } }); return s.seed === 4242 && s.perkId === null && s.challenge!.score === chA.sc && makeEntry({ ...s, status: 'WON', currentDay: 9 }, 2, { pid: 'z', name: 'Z', crew: '' }).kind === 'challenge'; })());
ok('the same seed gives the same case for every player', JSON.stringify(Actions.startMatch(chA.t, chA.k, null, chA.c, { seed: 99 }).states) === JSON.stringify(Actions.startMatch(chA.t, chA.k, null, chA.c, { seed: 99 }).states) && (() => { const mk = () => SimulationEngine.processTick({ ...Actions.startMatch('iyaloja_general', 'FINANCIAL', null, 'CLEAR_SKIES', { seed: 7 }), hasPoppedFirstSpark: true, hasPlantedSeed: true, startingStateId: 'kano' }); return JSON.stringify(mk().states) === JSON.stringify(mk().states); })());
ok('the layout setting is sanitised', sanitizeSettings({ layout: 'desktop' }).layout === 'desktop' && sanitizeSettings({ layout: 'tv' }).layout === 'auto' && sanitizeSettings({ playerName: '<i>x'.repeat(30) }).playerName.length <= 20);

ok('the premium features are listed and the config switches default to "coming soon"', PREMIUM_FEATURES.length >= 3 && MONETIZATION_LIVE === false && PAYMENT_URL === '');
// ---------------------------------------------------------------------------
// Premium licences
// ---------------------------------------------------------------------------
const issueLicense = async (payload: object): Promise<string> => {
  const { readFileSync } = await import('node:fs');
  const jwk = JSON.parse(readFileSync('private/license-private.jwk', 'utf8'));
  const priv = await crypto.subtle.importKey('jwk', jwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, priv, Buffer.from(body));
  return `RUMP1.${body}.${Buffer.from(sig).toString('base64url')}`;
};

// ---- THE STORY SCRIPT: scenes, clues, plot beats, and what a finished chapter does to Trust and the clue board
{
  const scenes = [PROLOGUE, ...Object.values(SCRIPTS).flatMap(sc => [sc.pre, sc.won, sc.lost].filter((x): x is NonNullable<typeof x> => !!x))];
  const beats = scenes.flatMap(sc => sc.beats.map(b => ({ sc: sc.id, b })));
  const settable = new Set<string>();
  const optionIds = new Set<string>();
  const addFx = (fx?: { flags?: string[] }) => fx?.flags?.forEach(f => settable.add(f));
  scenes.forEach(sc => addFx(sc.onEnd));
  beats.forEach(({ b }) => { if (b.t === 'choice') b.options.forEach(o => { addFx(o.effects); optionIds.add(`${b.id}:${o.id}`); }); });
  allPlotEvents().forEach(p => p.choices.forEach(c => addFx(c.story)));

  ok('there are 24 clues, with unique ids C01 to C24', CLUES.length === 24 && new Set(CLUES.map(c => c.id)).size === 24 && CLUES.every((c, i) => c.id === `C${String(i + 1).padStart(2, '0')}` && c.detail.length > 30));
  ok('every scene is non-empty and has a unique id', scenes.every(sc => sc.beats.length > 0) && new Set(scenes.map(sc => sc.id)).size === scenes.length);
  ok('every clue a scene pins exists on the board', beats.every(({ b }) => b.t !== 'clue' || !!CLUE_BY_ID[b.id]), beats.filter(({ b }) => b.t === 'clue' && !CLUE_BY_ID[b.id]).map(x => x.sc).join());
  ok('Act 1 pins clues C01 to C07 exactly once each', ['C01', 'C02', 'C03', 'C04', 'C05', 'C06', 'C07'].every(id => beats.filter(({ b }) => b.t === 'clue' && b.id === id).length === 1));
  ok('every choice has unique option ids and at least two options', beats.every(({ b }) => b.t !== 'choice' || (new Set(b.options.map(o => o.id)).size === b.options.length && b.options.length >= 2)));
  ok('a timed choice names a fallback that exists', beats.every(({ b }) => b.t !== 'choice' || !b.timer || b.options.some(o => o.id === b.fallback)));
  ok('every flag a beat tests for can be set by some choice', beats.every(({ b }) => !b.when || [b.when.flag, b.when.notFlag].every(f => !f || settable.has(f))), beats.filter(({ b }) => b.when && [b.when.flag, b.when.notFlag].some(f => f && !settable.has(f))).map(x => x.sc).join());
  ok('every choice a beat tests for exists', beats.every(({ b }) => !b.when?.choice || optionIds.has(`${b.when.choice[0]}:${b.when.choice[1]}`)));
  ok('scripted chapters are real chapters, and plot beats fall on playable days', Object.keys(SCRIPTS).every(id => !!STORY_CHAPTERS.find(c => c.id === id)) && allPlotEvents().every(p => p.day >= 4 && p.day <= 30 && p.choices.some(c => !c.cost)));
  ok('plot beats are decision cards that are never drawn at random', allPlotEvents().every(p => EVENTS.find(e => e.id === p.id)?.scripted === true));
  const drawn = new Set<string>();
  for (let i = 0; i < 400; i++) { const st = { ...started(), currentDay: 12 + (i % 10), lastEventDay: 0, usedEvents: [] as string[] }; const pk = pickEvent(st, fixed((i % 97) / 97), 1, 0, 0); if (pk) drawn.add(pk.def.id); }
  ok('random play never draws a plot beat', allPlotEvents().every(p => !drawn.has(p.id)));
  ok('each chapter schedules its plot beats on the Target it belongs to', STORY_CHAPTERS.filter(c => SCRIPTS[c.id]?.plot).every(c => c.variants.every(v => (getTarget(v.targetId).occurrences ?? []).some(o => SCRIPTS[c.id].plot!.some(p => p.id === o.eventId)))));

  // effects and conditions
  const base0 = emptyStory();
  const fx = applyStoryEffects(base0, { trust: 99, coker: -99, integrity: 99, flags: ['a', 'a'], clues: ['C01', 'C01', 'NOPE'] }, ['x', 'y']);
  ok('story effects stay inside their limits and never duplicate', fx.trust === 10 && fx.coker === 0 && fx.integrity === 12 && fx.flags.length === 1 && fx.clues.length === 1 && fx.choices.x === 'y');
  ok('conditions on flags, clues, Trust and choices work', condHolds(fx, { flag: 'a', clue: 'C01', trustGte: 10, choice: ['x', 'y'] }) && !condHolds(fx, { notFlag: 'a' }) && !condHolds(fx, { cokerGte: 1 }) && condHolds(fx, undefined));
  const old = sanitizeStory({ picks: {}, results: {}, integrity: 3, prologueSeen: true });
  ok('a save from before the thriller layer loads with sensible defaults', old.trust === 5 && old.coker === 0 && old.flags.length === 0 && old.clues.length === 0 && old.integrity === 3 && old.prologueSeen);
  ok('a damaged story block is cleaned, not trusted', (() => { const d = sanitizeStory({ trust: 'x', coker: 99, flags: [1, 'ok', 'x'.repeat(80)], clues: ['C01', 'ZZ'], choices: { a: 'b', c: 4 }, scenesSeen: 'no' }); return d.trust === 5 && d.coker === 10 && d.flags.join() === 'ok' && d.clues.join() === 'C01' && d.choices.a === 'b' && !('c' in d.choices) && d.scenesSeen.length === 0; })());

  // a finished chapter applies the choices made in its plot beats (once)
  let m = Actions.plantSeed(Actions.startMatch('story_ex_boyfriend', 'FINANCIAL', perkIdFor(emptyStory(), 'truth'), 'CLEAR_SKIES', { storyId: 'c01' }), 'kano');
  m = { ...m, storyChoices: ['plot_c01_oracle:trace'], status: 'WON', copySeed: 424242, currentDay: 15 } as GameState;
  const prof0 = emptyProfile();
  const done1 = recordChapter(prof0, m);
  ok('winning a chapter applies what you chose in its plot beats', done1.story.trust === 6 && done1.story.flags.includes('traced_oracle'), JSON.stringify([done1.story.trust, done1.story.flags]));
  ok('the same win is not applied twice', JSON.stringify(recordChapter(done1, m).story) === JSON.stringify(done1.story));
  // choosing a plot card during a real match records the choice
  let live = Actions.dismissTopAlert(Actions.collectSpark(Actions.plantSeed(Actions.startMatch('story_ex_boyfriend', 'FINANCIAL', perkIdFor(emptyStory(), 'truth'), 'CLEAR_SKIES', { storyId: 'c01' }), 'kano'), seedSparkId('kano')));
  let fired = false;
  for (let i = 0; i < 14 && live.status === 'PLAYING'; i++) {
    live = SimulationEngine.processTick(live, fixed(0.97));
    const card = live.notificationQueue.find(a => a.eventId === 'plot_c01_oracle');
    if (card) { fired = live.currentDay >= 8; live = { ...live, notificationQueue: [card] }; live = Actions.chooseOption(live, 'ignore', fixed(0.5)); break; }
    live = { ...live, notificationQueue: [] };
  }
  ok('the chapter\'s plot beat fires on its day and the choice is recorded', fired && live.storyChoices.includes('plot_c01_oracle:ignore'));
}

const runArenaTests = async () => {
  const okFor = (c: boolean, n: string, extra = '') => ok(n, c, extra);
  // ---- START OVER: deletes everything, keeps a licence and the founder’s mark
  {
    const mk = () => { const m = new Map<string, string>(); return { get length() { return m.size; }, key: (i: number) => [...m.keys()][i] ?? null, getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => { m.set(k, v); }, removeItem: (k: string) => { m.delete(k); }, _m: m }; };
    const prevL = (globalThis as any).localStorage, prevS = (globalThis as any).sessionStorage;
    const fill = () => {
      const L = mk(), S = mk();
      ['rumor_game_save_v9', 'rumor_meta_profile_v1', 'rumor_arena_v1', 'rumor_scores_v1', 'rumor_tour_done', 'rumor_reveals_seen', 'rumor_player_id', 'rumor_target_drafts_v1'].forEach(k => L.setItem(k, 'x'));
      L.setItem(LICENSE_KEY, 'RUMP1.licence'); L.setItem('other_site_key', 'keep'); L.setItem('rumor_sfx_muted', '1');
      L.setItem('rumor_settings_v1', JSON.stringify({ tutorialDone: true, seenHints: ['heat'], playerName: 'Ada', crew: 'Crew', eggFound: true, textSize: 'large', muted: true }));
      S.setItem('rumor_score_mark', 'y'); S.setItem('unrelated', 'z');
      (globalThis as any).localStorage = L; (globalThis as any).sessionStorage = S;
      return { L, S };
    };
    let { L, S } = fill();
    wipeData(true);
    const st = JSON.parse(L.getItem('rumor_settings_v1') ?? '{}');
    okFor(['rumor_game_save_v9', 'rumor_meta_profile_v1', 'rumor_arena_v1', 'rumor_scores_v1', 'rumor_tour_done', 'rumor_reveals_seen', 'rumor_player_id', 'rumor_target_drafts_v1'].every(k => L.getItem(k) === null), 'start over deletes the saved match, profile, story, Arena, scores, tips and tutorial flags');
    okFor(L.getItem(LICENSE_KEY) === 'RUMP1.licence' && L.getItem('other_site_key') === 'keep', 'start over keeps a Gist Pass licence and never touches keys that are not the game’s');
    okFor(S.getItem('rumor_score_mark') === null && S.getItem('unrelated') === 'z', 'start over clears the game’s session data only');
    okFor(st.tutorialDone === false && st.seenHints.length === 0 && st.playerName === '' && st.textSize === 'large' && st.muted === true && st.eggFound === true && L.getItem('rumor_sfx_muted') === '1', 'with "keep my settings" the preferences stay, the tutorial and hints reset, the founder’s mark stays found');
    ({ L, S } = fill());
    wipeData(false);
    const st2 = JSON.parse(L.getItem('rumor_settings_v1') ?? '{}');
    okFor(Object.keys(st2).join() === 'eggFound' && st2.eggFound === true && L.getItem(LICENSE_KEY) === 'RUMP1.licence', 'without it the settings go too, but the licence and the founder’s mark still stay');
    (globalThis as any).localStorage = prevL; (globalThis as any).sessionStorage = prevS;
  }

  // ---- THE ARENA: player-made Targets, the thirty bots, the bot check, codes and fees
  {
    const mk = (over: Partial<TargetDef> = {}): TargetDef => ({
      ...newBlankDef(), id: 'arena_test_one', kind: 'PLAYER', fullName: 'Chief Wahala "The Mouth" Obi', shortName: 'Chief Wahala', title: 'Big Man of Nowhere',
      personality: 'Says anything. Means less. Owns a lot of generators.', passiveName: 'Generator Money', passiveFlavor: 'Everybody owes him a favour and a litre of diesel.', ...over
    });
    // free words: anything the player writes is accepted; only the structure is checked
    const wild = mk({ fullName: 'Whoever Real Person Is', scandals: [{ category: 'FINANCIAL', title: 'Looted the billions and ran off with the minister’s wife' }] });
    okFor(validateTargetDef(wild, { builtInIds: builtInIds() }).errors.length === 0, 'Arena Targets may use any words (real names, crimes and all): only the structure is checked');
    okFor(validateTargetDef({ ...wild, kind: 'FICTIONAL', fullName: 'Aliko Dangote' }, { builtInIds: builtInIds() }).errors.length > 0, 'official Targets still refuse real names');
    okFor(validateTargetDef(mk({ mods: { heatRate: 9 } }), { builtInIds: builtInIds() }).errors.length > 0, 'a dial outside the tested range is refused');
    okFor(validateTargetDef(mk({ occurrences: [{ eventId: 'nope', day: 8 }] }), { builtInIds: builtInIds() }).errors.length > 0, 'a scheduled event that does not exist is refused');
    okFor(validateTargetDef(mk({ occurrences: [{ eventId: 'power_outage', day: 8 }, { eventId: 'fuel_protests', day: 12 }] }), { builtInIds: builtInIds() }).errors.length === 0, 'two scheduled news events are accepted');

    // thirty bots, all different
    okFor(STRATEGIES_30.length === 30, 'there are thirty bot plans');
    okFor(new Set(STRATEGIES_30.map(x => x.name)).size === 30, 'every bot plan has its own name');
    okFor(new Set(STRATEGIES_30.map(x => JSON.stringify([x.lanes, x.quiet, x.exploit, x.evidence, x.defend, x.seed]))).size === 30, 'no two bot plans are identical');
    okFor(STRATEGIES_30.every(x => !!STRATEGY_TIPS[x.name]), 'every bot plan has a tip');
    okFor(STRATEGIES_30.slice(0, 10).map(x => x.name).join() === STRATEGIES.map(x => x.name).join(), 'the original ten plans are untouched (the official Targets were tuned with them)');

    // the new moves do what they say
    const ab = (kind: AbilityKind, strength: number, extra: Partial<AbilityDef> = {}): AbilityDef => ({ kind, every: 8, start: 7, strength, stamp: 's', headline: 'h', line: 'l', ...extra });
    const base0 = started('godfather', 'FINANCIAL', 'kano');
    const hit = (a: AbilityDef) => applyEffects({ ...base0, sparks: 50, investigationProgress: 40 }, abilityEffects(a, base0), fixed(0.5), 'x').state;
    const dBefore = Object.values(base0.states).reduce((n, st) => n + st.doubt, 0);
    okFor(Object.values(hit(ab('DOUBT_WAVE', 10)).states).reduce((n, st) => n + st.doubt, 0) > dBefore, 'Smear Wave raises Doubt');
    okFor(hit(ab('EVIDENCE_RAID', 15)).investigationProgress === 25, 'Evidence Raid sets Investigation back');
    okFor(hit(ab('ACCOUNT_FREEZE', 20)).sparks === 30, 'Account Freeze seizes Sparks');
    okFor(hit(ab('ROADBLOCK', 3)).timedEffects.some(t => t.kind === 'HIGHWAY_MULT' && t.mult === 0.5), 'Roadblocks halve land-border spread');
    okFor(hit(ab('LANE_JAM', 3, { branch: 'PRESS' })).timedEffects.some(t => t.kind === 'BRANCH_MULT' && t.branch === 'PRESS'), 'Channel Jam hits the chosen lane');
    okFor(hit(ab('REGION_LOCK', 3, { zone: 'NE' })).timedEffects.some(t => t.kind === 'ZONE_FRICTION' && t.zone === 'NE'), 'Region Lockdown hits the chosen region');

    // scheduled natural occurrences fire on their day
    registerPack({ schema: 1, packId: 'verify_arena', name: 'v', author: 'v', version: 1, targets: [mk({ id: 'arena_test_two', occurrences: [{ eventId: 'fuel_protests', day: 6 }] })] });
    let occ = Actions.plantSeed(Actions.startMatch('arena_test_two', 'FINANCIAL'), 'kano');
    occ = Actions.dismissTopAlert(Actions.collectSpark(occ, seedSparkId('kano')));
    let sawEvent = false;
    for (let i = 0; i < 12 && occ.status === 'PLAYING'; i++) {
      occ = SimulationEngine.processTick(occ, fixed(0.9));
      if (occ.notificationQueue.some(a => a.eventId === 'fuel_protests')) { sawEvent = occ.currentDay >= 6; break; }
      occ = { ...occ, notificationQueue: [] };
    }
    okFor(sawEvent, 'a scheduled news event appears on or after its day');
    unregisterPack('verify_arena', false);

    // codes and fees
    const code = await encodeTarget(mk());
    const back = await decodeTarget(code);
    okFor(!!back.def && back.def.fullName === mk().fullName && back.def.kind === 'PLAYER' && /^s_/.test(back.def.id), 'a Target survives being turned into a code and back');
    okFor((await decodeTarget(code)).def?.id === back.def?.id, 'the same Target always gets the same id');
    okFor((await decodeTarget('RUMT1.not-a-real-code')).def === null && (await decodeTarget('hello')).def === null, 'garbage is not accepted as a Target');
    const tampered = await decodeTarget(await encodeTarget(mk({ mods: { heatRate: 1.5 } })).then(c => c.replace(/.$/, c.endsWith('A') ? 'B' : 'A')));
    okFor(tampered.def === null || validateTargetDef(tampered.def, { builtInIds: builtInIds() }).errors.length === 0, 'a damaged code is refused or still valid, never half-valid');
    okFor(creationFee(mk(), { difficulty: 30 }) === 50 && creationFee(mk({ abilities: [mk().abilities[0], { ...mk().abilities[0] }] }), { difficulty: 30 }) === 55, 'the publishing fee is 20 + difficulty + 5 per extra power');
    okFor(RATING_KNOTS.every((k, i) => i === 0 || (k[0] > RATING_KNOTS[i - 1][0] && k[1] >= RATING_KNOTS[i - 1][1])), 'the rating curve only ever rises');
    okFor(ratingFromD(0) <= 400 && ratingFromD(100) >= 3300 && ratingFromD(20) < ratingFromD(40), 'ratings run from easy to brutal');

    // the bot check
    const easy = await runBotCheck(mk(), { runs: 3 });
    okFor(easy.ok && easy.plans.length === 30 && easy.tips.length >= 2, 'the bot check plays thirty plans and gives tips', JSON.stringify(easy.errors));
    okFor(easy.plans.every((p, i) => i === 0 || easy.plans[i - 1].win >= p.win), 'plans are listed best first');
    const brutal = mk({ tier: 5, mods: { doubtFlat: 60, doubtRate: 2.2, heatRate: 2, coverUpRate: 2, days: -14, counterHeat: 15, forgeryRisk: 0.4, staleRate: 1.5 },
      abilities: [ab('INJUNCTION', 5, { every: 3 }), ab('HEAT_SURGE', 18, { every: 3 }), ab('COUNTER_STORY', 16, { every: 3 })], ai: { ...mk().ai, defenseStyle: 'IRON_FIST', temperament: 'THE_BULLY' } });
    const hard = await runBotCheck(brutal, { runs: 3 });
    okFor(hard.ok && hard.verdict === 'too_hard' && hard.best < FAIR_FLOOR, 'an impossible Target is dropped as too hard', `best ${hard.best}`);
    okFor(hard.difficulty > easy.difficulty && hard.rating > easy.rating, 'a harder Target gets a higher difficulty and rating');
    const fix = await suggestEase(brutal);
    okFor(!!fix && fix.report.best >= FAIR_FLOOR + 8 && describeChanges(brutal, fix.def).length > 0, 'a too-hard Target gets an eased version that is fair, with the changes listed', fix ? `factor ${fix.factor} best ${fix.report.best}` : 'no fix');
    okFor(!(await runBotCheck({ ...mk(), shortName: '' }, { runs: 2 })).ok, 'a Target with a missing name is refused with errors, not played');
    okFor(TARGETS.every(x => x.id !== CHECK_ID), 'the bot check leaves nothing behind in the roster');
  }

};

void (async () => {
  await runArenaTests();
  let haveKey = true;
  try { await issueLicense({ v: 1, id: 'probe', plan: 'forever', exp: 0, note: '', at: 1 }); } catch { haveKey = false; }
  if (!haveKey) { console.log('(licence tests skipped: private/license-private.jwk is not on this machine)'); return; }
  const good = await issueLicense({ v: 1, id: 'abc123', plan: 'forever', exp: 0, note: 'Tester', at: Date.now() });
  const ent = await verifyLicense(good);
  const okFor = (c: boolean, n: string) => ok(n, c);
  okFor(!!ent && ent.active && ent.plan === 'forever' && ent.note === 'Tester' && ent.expires === null, 'a signed licence is accepted and gives Premium');
  const [pre, body, sig] = good.split('.');
  const forgedBody = Buffer.from(JSON.stringify({ v: 1, id: 'abc123', plan: 'forever', exp: 0, note: 'Hacker', at: 1 })).toString('base64url');
  okFor((await verifyLicense([pre, forgedBody, sig].join('.'))) === null, 'a licence with a changed payload is rejected');
  okFor((await verifyLicense([pre, body, sig.slice(0, -4) + 'AAAA'].join('.'))) === null, 'a licence with a damaged signature is rejected');
  okFor((await verifyLicense('RUMP1.abc.def')) === null && (await verifyLicense('hello')) === null && (await verifyLicense('')) === null, 'garbage is rejected');
  const expired = await issueLicense({ v: 1, id: 'old', plan: 'season', exp: Date.now() - 1000, note: '', at: 1 });
  okFor((await verifyLicense(expired)) === null, 'an expired licence is rejected');
  const season = await issueLicense({ v: 1, id: 'sea', plan: 'season', exp: Date.now() + 86400000, note: '', at: 1 });
  okFor(!!(await verifyLicense(season))?.expires, 'a time-limited licence works until it expires');
  // a licence signed by some other key must not pass
  const other = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
  const fb = Buffer.from(JSON.stringify({ v: 1, id: 'fake', plan: 'forever', exp: 0, note: '', at: 1 })).toString('base64url');
  const fsig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, other.privateKey, Buffer.from(fb));
  okFor((await verifyLicense(`RUMP1.${fb}.${Buffer.from(fsig).toString('base64url')}`)) === null, 'a licence signed with someone else\'s key is rejected');
  console.log(`\n${pass} passed, ${fail} failed (after licence checks)`);
  process.exit(fail ? 1 : 0);
})();

