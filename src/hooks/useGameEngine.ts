import { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, ModalState } from '../engine/types';
import { SaveManager } from '../engine/saveManager';
import { SimulationEngine, canTick } from '../engine/simulation';
import { Actions } from '../engine/actions';
import { createLobbyState } from '../engine/newGame';
import { BALANCE } from '../engine/balance';
import { ScandalCategory } from '../engine/data/channels';
import { Tier, TargetId, getTarget } from '../engine/data/targets';
import { getSettings } from '../ui/settings';
import {
  Challenge, ScoreEntry, challengeId, decodeChallenge, decodeScores, localScoreStore, makeEntry, playerId
} from '../engine/scores';
import { starsFor } from '../engine/profile';
import { randomClimateId } from '../engine/data/climates';
import { dailyCase, dateKeyOf } from '../engine/daily';
import {
  MetaProfile, applyWin, bribeTarget, buyPerk, buyTier, eraseProfile, equipPerk, importProfile, loadProfile, saveProfile
} from '../engine/profile';
import { nationalBelieverPct } from '../engine/selectors';
import { addClue, applyStoryEffects, choosePick, emptyStory, markPrologueSeen, markSceneSeen, perkIdFor, recordChapter, variantFor } from '../engine/story';
import type { StoryEffects } from '../engine/season/types';
import { getChapter } from '../engine/data/story';
import type { StoryApproach } from '../engine/data/perks';
import { ARENA_WIN_REWARD, recordArenaMatch } from '../engine/arena';

export const TICK_MS = BALANCE.tickMs;

// ?unlock=all opens every tier without touching the saved profile (for testing and demos).
const unlockAllFromUrl = (): boolean => {
  try { return new URLSearchParams(window.location.search).get('unlock') === 'all'; } catch { return false; }
};

export const useGameEngine = () => {
  const [gameState, setGameState] = useState<GameState>(() => SaveManager.load());
  const [profile, setProfileState] = useState<MetaProfile>(() => loadProfile());
  const unlockAll = useRef(unlockAllFromUrl()).current;
  // Offline leaderboards: every score on this device, mine and the ones friends sent me.
  const [scores, setScores] = useState<ScoreEntry[]>(() => localScoreStore.load());
  // The tutorial holds the clock while it is explaining something.
  const [hold, setHold] = useState(false);
  const profileRef = useRef(profile);

  // The forecast for the next case is shown on the Dossier, so players can pick a Target that suits the weather.
  const initialClimate = useRef(randomClimateId()).current;
  const [climateId, setClimateId] = useState<string>(initialClimate);
  const climateRef = useRef<string>(initialClimate);

  // The Daily Case for today's date (the same for every player).
  const [todayKey] = useState<string>(() => dateKeyOf());
  const daily = dailyCase(todayKey);

  // Single entry point for profile changes: keep the ref, state and storage in step.
  const commitProfile = useCallback((next: MetaProfile) => {
    profileRef.current = next;
    saveProfile(next);
    setProfileState(next);
  }, []);

  // Persist every state change (transient map events and chatter are stripped by SaveManager).
  useEffect(() => {
    SaveManager.save(gameState);
  }, [gameState]);

  // Meta-progression: stars and Brown Envelopes. The rewards are stored on the finished match, so a win is
  // claimed exactly once even if the page is reloaded on the victory screen.
  useEffect(() => {
    if (gameState.status !== 'WON' || gameState.winRewards) return;
    const result = applyWin(profileRef.current, gameState, nationalBelieverPct(gameState.states));
    if (!result) return;
    commitProfile(result.profile);
    setGameState(prev => (prev.status === 'WON' && !prev.winRewards ? { ...prev, winRewards: result.rewards } : prev));
  }, [gameState, commitProfile]);

  // Leaderboards: a win becomes a score once, after its rewards are stored. Training cases never count.
  useEffect(() => {
    if (gameState.status !== 'WON' || !gameState.winRewards || gameState.training || getTarget(gameState.activeTargetId).kind === 'PLAYER') return;
    const mark = `${gameState.copySeed}:${gameState.currentDay}`;
    try { if (sessionStorage.getItem('rumor_score_mark') === mark) return; sessionStorage.setItem('rumor_score_mark', mark); } catch { /* storage unavailable */ }
    const st = getSettings();
    const entry = makeEntry(gameState, gameState.winRewards.stars || starsFor(gameState), { pid: playerId(), name: st.playerName, crew: st.crew });
    setScores(localScoreStore.add([entry]).entries);
  }, [gameState]);

  // The Arena: a finished match against a player-made Target is recorded (plays, wins, best day). The first win against each pays a few envelopes.
  // Arena matches never give stars and never count towards unlocking tiers.
  useEffect(() => {
    if (gameState.status === 'PLAYING' || gameState.status === 'LOBBY' || gameState.training || !gameState.activeTargetId) return;
    const t = getTarget(gameState.activeTargetId);
    if (t.kind !== 'PLAYER') return;
    const mark = `${gameState.copySeed}:${gameState.currentDay}:${gameState.status}`;
    try { if (sessionStorage.getItem('rumor_arena_mark') === mark) return; sessionStorage.setItem('rumor_arena_mark', mark); } catch { /* storage unavailable */ }
    const reward = recordArenaMatch(t.id, gameState.status === 'WON', Math.min(gameState.currentDay, gameState.dayBudget));
    if (reward > 0) commitProfile({ ...profileRef.current, envelopes: Math.min(1e6, profileRef.current.envelopes + reward) });
  }, [gameState, commitProfile]);

  // Story Mode: record a finished chapter (reputation, unlocks). Safe to run on every render: a match is recorded once.
  useEffect(() => {
    if (!gameState.storyId || gameState.status === 'PLAYING' || gameState.status === 'LOBBY') return;
    const next = recordChapter(profileRef.current, gameState);
    if (next !== profileRef.current) commitProfile(next);
  }, [gameState, commitProfile]);

  // The clock must never run while the player is away (a call, another app, a locked phone): pause when the page is hidden.
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState !== 'hidden') return;
      setGameState(prev => (prev.status === 'PLAYING' && prev.hasPoppedFirstSpark && !prev.isPaused && prev.notificationQueue.length === 0 && prev.activeModal === 'NONE' ? Actions.pause(prev) : prev));
    };
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', onHide);
    return () => { document.removeEventListener('visibilitychange', onHide); window.removeEventListener('pagehide', onHide); };
  }, []);

  // The daily clock. canTick() is the Phase 1 hard lock: no tick while the first spark is unpopped,
  // the game is paused, an alert is waiting, or a desk/modal is open.
  const ticking = canTick(gameState) && !hold;
  // ?speed=N shortens the day in the dev server only, so long sessions can be tested quickly. It does not exist in a build.
  const devSpeed = import.meta.env.DEV ? Math.max(1, Number(new URLSearchParams(window.location.search).get('speed')) || 1) : 1;
  const tickMs = Math.round((gameState.assisted ? TICK_MS * BALANCE.assistTickMult : TICK_MS) / devSpeed);
  useEffect(() => {
    if (!ticking) return;
    const timer = setInterval(() => {
      setGameState(prev => SimulationEngine.processTick(prev));
    }, tickMs);
    return () => clearInterval(timer);
  }, [ticking, tickMs]);

  const apply = useCallback((fn: (s: GameState) => GameState) => setGameState(prev => fn(prev)), []);

  const rerollClimate = useCallback(() => {
    const next = randomClimateId();
    climateRef.current = next;
    setClimateId(next);
  }, []);

  const startMatch = useCallback((targetId: TargetId, category: ScandalCategory) => {
    const p = profileRef.current;
    const perk = p.equippedPerkId && p.unlockedPerks.includes(p.equippedPerkId) ? p.equippedPerkId : null;
    setGameState(Actions.startMatch(targetId, category, perk, climateRef.current, { assisted: getSettings().assist }));
    rerollClimate();
  }, [rerollClimate]);

  // The Daily Case: fixed Target, scandal, climate and seed; no perks.
  const startDaily = useCallback(() => {
    const d = dailyCase(todayKey);
    setGameState(Actions.startMatch(d.targetId, d.category, null, d.climateId, { seed: d.seed, dailyKey: d.dateKey, assisted: getSettings().assist }));
  }, [todayKey]);

  // The guided first case: a fixed, gentle Target and a fixed seed, with no rewards.
  // It is always the same very easy Target (Amaka, see ColdOpen), so the first case can be won while learning.
  const trainingMatch = () => {
    const t = getTarget('slay_queen');
    try { localStorage.removeItem('rumor_tour_done'); } catch { /* storage unavailable */ }
    return Actions.startMatch(t.id, t.scandals[0].category, null, 'CLEAR_SKIES', { seed: 7, training: true });
  };
  const startTraining = useCallback(() => setGameState(trainingMatch()), []);
  // The first screen already asked "which state you dey?", so the rumour is planted there and play starts at the first spark.
  const startFirstRumor = useCallback((stateId: string) => setGameState(Actions.plantSeed(trainingMatch(), stateId)), []);

  // The Arena: no perks, and the Target's own news climate if its maker chose one. Fair for everyone.
  const startArenaMatch = useCallback((targetId: string) => {
    const t = getTarget(targetId);
    setGameState(Actions.startMatch(t.id, t.scandals[0].category, null, t.climateId ?? climateRef.current, { assisted: getSettings().assist }));
    rerollClimate();
  }, [rerollClimate]);
  // Spending Brown Envelopes (publishing a Target). Returns false, and spends nothing, if there are not enough.
  const spendEnvelopes = useCallback((n: number): boolean => {
    if (n <= 0) return true;
    if (profileRef.current.envelopes < n) return false;
    commitProfile({ ...profileRef.current, envelopes: profileRef.current.envelopes - n });
    return true;
  }, [commitProfile]);

  // Story Mode: start a chapter with the chosen approach. The Target's first scandal is the story's grievance.
  const startStory = useCallback((chapterId: string, approach: StoryApproach) => {
    const ch = getChapter(chapterId);
    const story = profileRef.current.story;
    const variant = ch ? variantFor(ch, story) : null;
    if (!ch || !variant) return;
    const t = getTarget(variant.targetId);
    setGameState(Actions.startMatch(t.id, t.scandals[0].category, perkIdFor(story, approach), variant.climateId, { storyId: ch.id, assisted: getSettings().assist }));
  }, []);
  // The thriller layer: choices in scenes and plot beats, clues pinned to the board, scenes already seen.
  const storyApply = useCallback((fx?: StoryEffects, choice?: [string, string]) => {
    if (!fx && !choice) return;
    commitProfile({ ...profileRef.current, story: applyStoryEffects(profileRef.current.story ?? emptyStory(), fx, choice) });
  }, [commitProfile]);
  const storyClue = useCallback((id: string) => commitProfile({ ...profileRef.current, story: addClue(profileRef.current.story ?? emptyStory(), id) }), [commitProfile]);
  const storySceneSeen = useCallback((id: string) => commitProfile({ ...profileRef.current, story: markSceneSeen(profileRef.current.story ?? emptyStory(), id) }), [commitProfile]);
  const pickStoryVariant = useCallback((chapterId: string, targetId: string) => commitProfile(choosePick(profileRef.current, chapterId, targetId)), [commitProfile]);
  const seeStoryPrologue = useCallback(() => commitProfile(markPrologueSeen(profileRef.current)), [commitProfile]);

  // A friend's challenge: the identical case (Target, scandal, climate and seed), no perks, so it is fair.
  const startChallenge = useCallback((c: Challenge) => {
    setGameState(Actions.startMatch(c.t, c.k, null, c.c, { seed: c.s, challenge: { id: challengeId(c), by: c.by, score: c.sc }, assisted: getSettings().assist }));
  }, []);

  // Paste a score code, a board code or a link. Returns how many new scores were added, or a challenge to offer.
  const importCode = useCallback((input: string): { added: number; challenge: Challenge | null } => {
    const challenge = decodeChallenge(input);
    const found = decodeScores(input);
    const added = found.length ? localScoreStore.add(found).added : 0;
    if (found.length) setScores(localScoreStore.load());
    return { added, challenge };
  }, []);

  // Back to the Classified Case File screen.
  const returnToDossier = useCallback(() => setGameState(createLobbyState()), []);

  // "New Investigation / Reset": wipe the save slot (profile, stars and envelopes are kept).
  const resetAll = useCallback(() => setGameState(SaveManager.hardReset()), []);

  // Erase stars, envelopes, perks and the archive.
  const resetProgress = useCallback(() => commitProfile(eraseProfile()), [commitProfile]);

  // Profile actions (Brown Envelopes economy)
  const bribe = useCallback((targetId: string) => {
    const next = bribeTarget(profileRef.current, targetId);
    if (next) commitProfile(next);
  }, [commitProfile]);
  const buyTierFiles = useCallback((tier: Tier) => {
    const next = buyTier(profileRef.current, tier);
    if (next) commitProfile(next);
  }, [commitProfile]);
  const buyPerkById = useCallback((perkId: string) => {
    const next = buyPerk(profileRef.current, perkId);
    if (next) commitProfile(next);
  }, [commitProfile]);
  const importProgress = useCallback((raw: unknown): boolean => {
    const next = importProfile(raw);
    if (!next) return false;
    commitProfile(next);
    return true;
  }, [commitProfile]);
  const grantEnvelopes = useCallback((n: number) => commitProfile({ ...profileRef.current, envelopes: Math.min(1e6, profileRef.current.envelopes + n) }), [commitProfile]);
  const equipPerkById = useCallback((perkId: string | null) => commitProfile(equipPerk(profileRef.current, perkId)), [commitProfile]);

  return {
    gameState,
    profile,
    climateId,
    daily,
    todayKey,
    unlockAll,
    startMatch,
    startDaily,
    startTraining,
    startFirstRumor,
    startArenaMatch,
    storyApply,
    storyClue,
    storySceneSeen,
    spendEnvelopes,
    scores,
    grantEnvelopes,
    startChallenge,
    importCode,
    startStory,
    pickStoryVariant,
    seeStoryPrologue,
    setHold,
    returnToDossier,
    resetAll,
    resetProgress,
    importProgress,
    bribe,
    buyTierFiles,
    buyPerk: buyPerkById,
    equipPerk: equipPerkById,
    plantSeed: useCallback((id: string) => apply(s => Actions.plantSeed(s, id)), [apply]),
    collectSpark: useCallback((id: string) => apply(s => Actions.collectSpark(s, id)), [apply]),
    popSpin: useCallback((id: string) => apply(s => Actions.popSpin(s, id)), [apply]),
    selectState: useCallback((id: string | null) => apply(s => Actions.selectState(s, id)), [apply]),
    setModal: useCallback((m: ModalState) => apply(s => Actions.setModal(s, m)), [apply]),
    pause: useCallback(() => apply(Actions.pause), [apply]),
    resume: useCallback(() => apply(Actions.resume), [apply]),
    dismissTopAlert: useCallback(() => apply(Actions.dismissTopAlert), [apply]),
    chooseOption: useCallback((id: string) => apply(s => Actions.chooseOption(s, id)), [apply]),
    buyChannel: useCallback((id: string) => apply(s => Actions.buyChannel(s, id)), [apply]),
    leakEvidence: useCallback((id: string) => apply(s => Actions.leakEvidence(s, id)), [apply]),
    buyDefense: useCallback((id: string) => apply(s => Actions.buyDefense(s, id)), [apply])
  };
};

export type GameEngine = ReturnType<typeof useGameEngine>;
