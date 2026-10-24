import { createContext, useContext } from 'react';

// THE THREE MODES. Each has its own look (palette and texture, see index.css) so the player always knows where they are:
//   arcade = the tabloid (newsprint), story = the thriller (night-blue noir), arena = the competition (neon on indigo).
export type Mode = 'arcade' | 'story' | 'arena';

export const MODE_META: Record<Mode, { name: string; icon: string; tagline: string; tex: string }> = {
  arcade: { name: 'Arcade', icon: '📰', tagline: 'Quick cases against the whole roster.', tex: 'tex-arcade' },
  story: { name: 'Story', icon: '🎬', tagline: 'One season. One conspiracy. Everything is personal.', tex: 'tex-story' },
  arena: { name: 'Arena', icon: '⚔️', tagline: 'Build a Target. Beat your friends’.', tex: 'tex-arena' }
};

export const ModeContext = createContext<Mode>('arcade');
export const useMode = (): Mode => useContext(ModeContext);

/** Which mode is on screen: a match is a Story, Arena or Arcade match by what it is; menus by which screen is open. */
export const modeFor = (o: { lobby: boolean; screen: 'dossier' | 'story' | 'boards' | 'arena'; storyId?: string | null; playerTarget?: boolean }): Mode => {
  if (!o.lobby) return o.storyId ? 'story' : o.playerTarget ? 'arena' : 'arcade';
  return o.screen === 'story' ? 'story' : o.screen === 'arena' ? 'arena' : 'arcade';
};
