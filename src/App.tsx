import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { useGameEngine } from './hooks/useGameEngine';
import { isGameOver } from './engine/types';
import { DossierScreen } from './ui/screens/DossierScreen';
import { LiveGameScreen } from './ui/screens/LiveGameScreen';
import { DesktopLiveScreen } from './ui/screens/DesktopLiveScreen';
import { useLayout } from './ui/useLayout';
import { EndgameScreen } from './ui/screens/EndgameScreen';
import { StoryEpilogue, StoryScreen } from './ui/screens/StoryScreen';
import { BoardsScreen, ChallengeIntro } from './ui/screens/BoardsScreen';
import { FounderReveal } from './ui/components/FounderReveal';
import { OWNER, EggSource, maybeFax, onEgg, startEggListeners, triggerEgg } from './ui/egg';
import { getSettings, updateSettings } from './ui/settings';
import { loadLicense } from './engine/premium';
import { usePremium } from './ui/usePremium';
import { initReminders, setAppBadge, syncReminderTags } from './ui/notify';
import { dailyStreak } from './engine/daily';
import type { Challenge } from './engine/scores';
import { ambientForClimate, sfx } from './ui/audio';
import type { MusicContext } from './ui/music/director';
import { nationalBelieverPct } from './engine/selectors';
import { getTarget } from './engine/data/targets';
import { getRosterVersion, subscribeRoster } from './engine/data/targetPacks';
import { parseStoryPerk } from './engine/data/perks';

// The Target Studio is a content tool for the team. It only exists in the dev server and in the separate studio build
// (`npm run build:studio`); the public game build contains none of its code. Locally: http://localhost:5173/?studio=1
const STUDIO_ENABLED = import.meta.env.DEV || import.meta.env.VITE_ENABLE_STUDIO === 'true';
const StudioScreen = STUDIO_ENABLED ? React.lazy(() => import('./ui/screens/StudioScreen').then(m => ({ default: m.StudioScreen }))) : null;
const studioRequested = (): boolean => {
  if (!STUDIO_ENABLED) return false;
  if (import.meta.env.VITE_STUDIO_ONLY === 'true') return true;
  try { return new URLSearchParams(window.location.search).get('studio') === '1'; } catch { return false; }
};

export default function App() {
  if (StudioScreen && studioRequested()) return <React.Suspense fallback={null}><StudioScreen /></React.Suspense>;
  return <Game />;
}

function Game() {
  const engine = useGameEngine();
  const { gameState, startMatch, resetAll, returnToDossier, profile, unlockAll, resetProgress, climateId, daily, startDaily, bribe, buyTierFiles, buyPerk, equipPerk, startTraining, importProgress, startStory, pickStoryVariant, seeStoryPrologue, scores, startChallenge, importCode, grantEnvelopes } = engine;
  const [screen, setScreen] = useState<'dossier' | 'story' | 'boards'>('dossier');
  const [incoming, setIncoming] = useState<Challenge | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [egg, setEgg] = useState<{ source: EggSource; reward: boolean } | null>(null);
  const premium = usePremium();
  const dailyDone = profile.dailyWins.includes(daily.dateKey);
  const streak = dailyStreak(profile.dailyWins, daily.dateKey);

  // Premium licence and reminders start once. The push SDK is only loaded if the player already opted in.
  useEffect(() => { void loadLicense(); void initReminders(); }, []);
  // A dot on the installed app's icon while today's Daily Case is waiting, and facts for smart reminder messages.
  useEffect(() => {
    setAppBadge(dailyDone ? 0 : 1);
    syncReminderTags({ streak: String(streak), daily_done: dailyDone ? 'yes' : 'no', last_played: daily.dateKey });
  }, [dailyDone, streak, daily.dateKey]);

  // The founder's mark: found, never shown. Listeners start once; any discovery path ends up here.
  useEffect(() => {
    startEggListeners();
    return onEgg(source => {
      const first = !getSettings().eggFound;
      if (first) { updateSettings({ eggFound: true }); grantEnvelopes(100); }
      setEgg({ source, reward: first });
    });
  }, [grantEnvelopes]);
  const shareEgg = async () => {
    const text = `I found the founder of I Heard A Rumor: ${OWNER.name}. Find the secret yourself: ${window.location.origin}${window.location.pathname}`;
    try { if (navigator.share) { await navigator.share({ text }); return; } } catch { /* fall back to copy */ }
    try { await navigator.clipboard.writeText(text); setToast('Copied. Paste it anywhere!'); setTimeout(() => setToast(null), 3000); } catch { /* clipboard unavailable */ }
  };
  const [epilogue, setEpilogue] = useState(false);

  // Links carry scores and challenges: ?s= adds scores to the board, ?c= opens a challenge. The address is cleaned afterwards.
  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search);
      const code = q.get('s') ? `?s=${q.get('s')}` : q.get('c') ? `?c=${q.get('c')}` : '';
      if (!code) return;
      const r = importCode(code);
      if (r.challenge) setIncoming(r.challenge);
      else if (r.added > 0) { setScreen('boards'); setToast(`Added ${r.added} score${r.added > 1 ? 's' : ''} to your leaderboard.`); setTimeout(() => setToast(null), 4000); }
      q.delete('s'); q.delete('c');
      const rest = q.toString();
      window.history.replaceState(null, '', window.location.pathname + (rest ? `?${rest}` : ''));
    } catch { /* a bad link is ignored */ }
  }, [importCode]);

  // Re-render when a content pack is loaded or removed (the roster is live data).
  useSyncExternalStore(subscribeRoster, getRosterVersion, getRosterVersion);

  // The soundtrack follows the case: chill on the Dossier, a groove while playing, tense when it is going wrong.
  const status = gameState.status;
  const started = gameState.hasPoppedFirstSpark;
  const heatQ = Math.round(gameState.heat / 5) * 5;
  const coverQ = Math.round(gameState.coverUp / 5) * 5;
  const believersQ = Math.round(nationalBelieverPct(gameState.states) / 5) * 5;
  const dayQ = Math.round((Math.min(gameState.currentDay, gameState.dayBudget) / gameState.dayBudget) * 10) / 10;
  useEffect(() => {
    const lobby = status === 'LOBBY';
    const over = !lobby && status !== 'PLAYING';
    const storyAct = (Math.min(3, Math.floor(Object.values(profile.story?.results ?? {}).filter(r => r.won).length / 3) + 1)) as 1 | 2 | 3;
    const ctx: MusicContext = lobby
      ? { screen: screen === 'story' ? 'story' : 'dossier', storyAct }
      : over
        ? { screen: 'end', won: status === 'WON' }
        : { screen: 'live', started, training: gameState.training, tier: getTarget(gameState.activeTargetId).tier, heat: heatQ, coverUp: coverQ, believers: believersQ, dayFrac: dayQ, climateId: gameState.climateId };
    sfx.setMusic(ctx, gameState.copySeed);
    sfx.setAmbient(status === 'PLAYING' && started ? ambientForClimate(gameState.climateId) : null);
  }, [status, started, screen, heatQ, coverQ, believersQ, dayQ, gameState.climateId, gameState.copySeed, gameState.training, gameState.activeTargetId, profile.story]);

  useEffect(() => { if (!isGameOver(status)) setEpilogue(false); }, [status]);
  // a very rare mysterious fax, on day 3 of a real case
  useEffect(() => { if (status === 'PLAYING' && !gameState.training && gameState.currentDay === 3 && maybeFax()) triggerEgg('fax'); }, [status, gameState.currentDay, gameState.training]);

  const over = isGameOver(gameState.status);
  const inStory = !!gameState.storyId;
  const desktop = useLayout() === 'desktop';

  const lobby = gameState.status === 'LOBBY';
  const storyScreen = (
    <StoryScreen
      profile={profile}
      onBack={() => setScreen('dossier')}
      onStart={startStory}
      onPick={pickStoryVariant}
      onPrologueSeen={seeStoryPrologue}
    />
  );
  const boardsScreen = (
    <BoardsScreen
      scores={scores} daily={daily} dailyDone={profile.dailyWins.includes(daily.dateKey)}
      onBack={() => setScreen('dossier')} onPlayDaily={() => { setScreen('dossier'); startDaily(); }}
      onImport={importCode} onPlayChallenge={c => { setScreen('dossier'); startChallenge(c); }}
    />
  );
  const content = lobby ? (
    screen === 'boards' ? (
      desktop
        ? <div className="flex-1 min-h-0 flex justify-center bg-[#EFEBE0]"><div className="w-full max-w-[820px] flex flex-col border-x-4 border-[#1A1A1A] shadow-2xl">{boardsScreen}</div></div>
        : boardsScreen
    ) : screen === 'story' ? (
      desktop
        ? <div className="flex-1 min-h-0 flex justify-center bg-[#EFEBE0]"><div className="w-full max-w-[780px] flex flex-col border-x-4 border-[#1A1A1A] shadow-2xl">{storyScreen}</div></div>
        : storyScreen
    ) : (
      <DossierScreen wide={desktop} profile={profile} climateId={climateId} daily={daily} onStartDaily={startDaily} unlockAll={unlockAll || !!premium} onStart={startMatch} onReset={resetAll} onEraseProgress={resetProgress} onBribe={bribe} onBuyTier={buyTierFiles} onBuyPerk={buyPerk} onEquipPerk={equipPerk} onStartTraining={startTraining} onImportProgress={importProgress} onOpenStory={() => setScreen('story')} onOpenBoards={() => setScreen('boards')} />
    )
  ) : (
    <>
      {desktop ? <DesktopLiveScreen engine={engine} /> : <LiveGameScreen engine={engine} />}
      {over && (
        <EndgameScreen
          gameState={gameState}
          rewards={gameState.winRewards}
          continueLabel={inStory ? 'Continue the story' : undefined}
          onNewInvestigation={() => { if (inStory) setEpilogue(true); else returnToDossier(); }}
        />
      )}
      {over && inStory && epilogue && (
        <StoryEpilogue
          gameState={gameState}
          profile={profile}
          onDone={() => { setEpilogue(false); returnToDossier(); setScreen('story'); }}
          onRetry={() => { const p = parseStoryPerk(gameState.perkId); setEpilogue(false); if (p && gameState.storyId) { setScreen('story'); startStory(gameState.storyId, p.approach); } }}
        />
      )}
    </>
  );

  // Phone: a portrait frame. Desktop: the whole window, with its own layouts (see ui/screens/Desktop*).
  const overlays = (
    <>
      {egg && <FounderReveal source={egg.source} reward={egg.reward} onClose={() => setEgg(null)} onShare={shareEgg} />}
      {incoming && <ChallengeIntro challenge={incoming} onCancel={() => setIncoming(null)} onPlay={() => { const c = incoming; setIncoming(null); setScreen('dossier'); startChallenge(c); }} />}
      {toast && <div role="status" className="absolute top-3 inset-x-3 z-[130] flex justify-center pointer-events-none"><div className="bg-[#1A1A1A] text-[#F4F1EA] border-2 border-[#FDE68A] rounded-lg px-4 py-2 text-[13px] font-bold shadow-lg">{toast}</div></div>}
    </>
  );

  return desktop ? (
    <div className="w-screen h-screen h-[100dvh] desk-room overflow-hidden select-none text-slate-100 flex flex-col font-sans relative">{content}{overlays}</div>
  ) : (
    <div className="w-full max-w-[440px] h-screen h-[100dvh] mx-auto relative overflow-hidden select-none shadow-2xl bg-[#0B0E14] text-slate-100 flex flex-col font-sans">{content}{overlays}</div>
  );
}
