import { getTarget } from './data/targets';
import type { CampaignInfo, CampaignType } from './data/targetTypes';

// CAMPAIGNS: the same contagion engine, pointed at something good (or useful) instead of a scandal. This file is the dictionary: what the game
// calls things when the Target is a campaign's opposition. Words change; the rules underneath do not.
export interface Vocab {
  campaign: boolean;
  cause: string;            // the campaign's name ('' for an ordinary case)
  adopters: string;         // the label for the number that wins the game: "Believers" / "Hand-washers"
  adoptersLow: string;
  doubt: string;
  coverUp: string;
  heat: string;
  heatIcon: string;
  evidence: string;
  evidenceDesk: string;
  defense: string;
  defenseDesk: string;
  verified: string;
  hype: string;
  brief: string;            // what the Target's info sheet is called
  opposition: string;       // "the Target" / "the opposition"
  spin: string;             // the dark bubbles
}

const STANDARD: Vocab = {
  campaign: false, cause: '', adopters: 'Believers', adoptersLow: 'believers', doubt: 'Doubt', coverUp: 'Cover-Up', heat: 'Heat', heatIcon: '🚨',
  evidence: 'Evidence', evidenceDesk: 'Evidence Locker', defense: 'Defense', defenseDesk: 'Defense Desk', verified: 'Verified Dossier Files', hype: 'Fabricated Forgeries',
  brief: 'Case file', opposition: 'the Target', spin: 'Spin'
};

export const campaignInfo = (targetId: string | null | undefined): CampaignInfo | undefined => (targetId ? getTarget(targetId).campaign : undefined);
export const isCampaignTarget = (targetId: string | null | undefined): boolean => !!campaignInfo(targetId);

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const vocabFor = (targetId: string | null | undefined): Vocab => {
  const c = campaignInfo(targetId);
  if (!c) return STANDARD;
  return {
    campaign: true, cause: c.cause, adopters: cap(c.adopter), adoptersLow: c.adopter, doubt: 'Skepticism', coverUp: 'Opposition', heat: 'Backlash', heatIcon: '📣',
    evidence: 'Proof', evidenceDesk: 'Proof Desk', defense: 'Protect', defenseDesk: 'Protection Desk', verified: 'Verified Proof', hype: 'Hype and Exaggeration',
    brief: 'Campaign brief', opposition: 'the opposition', spin: 'Hoax'
  };
};

/** Rewrites the engine's stock words for a campaign ("+12% Doubt, +4% Heat" becomes "+12% Skepticism, +4% Backlash"). Ordinary cases are untouched. */
export const campaignize = (text: string, v: Vocab): string => (!v.campaign ? text : text
  .replace(/Cover-Up/g, v.coverUp).replace(/\bDoubt\b/g, v.doubt).replace(/\bHeat\b/g, v.heat).replace(/\bBelievers\b/g, v.adopters)
  .replace(/\bEvidence\b/g, v.evidence).replace(/Spin bubbles?/gi, m => (m.endsWith('s') ? `${v.spin} bubbles` : `${v.spin} bubble`)));

export const CAMPAIGN_TYPES_META: Record<CampaignType, { icon: string; name: string; blurb: string; color: string }> = {
  HEALTH: { icon: '🩺', name: 'Health', blurb: 'Get a life-saving habit adopted before the season turns.', color: '#0F766E' },
  AWARENESS: { icon: '📣', name: 'Awareness', blurb: 'Make a problem impossible to ignore, and give people something to do about it.', color: '#B45309' },
  POLITICAL: { icon: '🗳️', name: 'Political', blurb: 'Civic drives that get people to take part, whoever they vote for.', color: '#1D4ED8' },
  MARKETING: { icon: '🛍️', name: 'Marketing', blurb: 'Launch something worth wanting, and win the shelf, the feed and the jingle.', color: '#9D174D' },
  MYTHBUST: { icon: '🔍', name: 'Myth-busting', blurb: 'A hoax is spreading. Spread the truth faster, with proof.', color: '#7C3AED' }
};

/** The angle names shown for a campaign's four ways in (they map onto the engine's four synergy categories). */
export const ANGLE_NAMES: Record<string, string> = { FINANCIAL: 'The money angle', AFFAIR: 'The family angle', LEAKED_MEDIA: 'The viral angle', FAKE_CREDENTIALS: 'The expert angle' };
