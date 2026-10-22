import { ScandalCategory } from './channels';

export type TargetId = 'godfather' | 'televangelist' | 'cryptoking' | 'minister';

export interface TargetArchetype {
  id: TargetId;
  fullName: string;
  shortName: string;      // Substituted for {Target} in flavor text
  title: string;
  defaultScandal: ScandalCategory;
  defaultScandalTitle: string;
  passiveName: string;
  passiveText: string;
  dossierBlurb: string;
}

export const TARGETS: TargetArchetype[] = [
  {
    id: 'godfather',
    fullName: 'Chief Obafemi "The Godfather" Adebayo',
    shortName: 'Chief Adebayo',
    title: 'Governor / Political Titan',
    defaultScandal: 'FINANCIAL',
    defaultScandalTitle: 'The Vanished ₦85B Ecological Fund',
    passiveName: 'Federal Might',
    passiveText: 'Elite hubs (Lagos, FCT, Ogun, Kaduna) resist street gossip even harder until PRESS/ELITE channels are chained. Heat rises 15% faster every day.',
    dossierBlurb: 'Three terms in Government House, a private jet fleet, and a billion-naira "ecological" budget that never saw a single gully.'
  },
  {
    id: 'televangelist',
    fullName: 'Apostle Miracle "Anointed" Chukwu',
    shortName: 'Apostle Chukwu',
    title: 'Mega-Church Televangelist',
    defaultScandal: 'AFFAIR',
    defaultScandalTitle: 'Secret Cyprus Villa & Leaked Entanglement Tapes',
    passiveName: 'Flock Immunity',
    passiveText: 'Baseline Doubt starts at 25% in every state because the faithful defend him blindly. You will need early synergy channels and hard evidence to break in.',
    dossierBlurb: 'Fifty thousand members, a prayer-line empire, and a Cyprus villa the congregation has been told does not exist.'
  },
  {
    id: 'cryptoking',
    fullName: 'Tobi "CryptoKing" Adeyemi',
    shortName: 'CryptoKing',
    title: 'Web3 / FinTech Ponzi Founder',
    defaultScandal: 'LEAKED_MEDIA',
    defaultScandalTitle: 'Leaked Voice Note Laughing at Wiped-Out Retail Investors',
    passiveName: 'Bot Farm War Chest',
    passiveText: 'PR Spin bubbles spawn twice as often in the online hubs (Lagos, Rivers, Enugu, Oyo, Abuja). Shatter them fast or Doubt spikes.',
    dossierBlurb: 'A zero-risk "yield platform" that froze withdrawals overnight, run by a man who still posts from his Lekki penthouse.'
  },
  {
    id: 'minister',
    fullName: 'Hon. Musa "Toronto" Danjuma',
    shortName: 'Hon. Danjuma',
    title: 'Federal Minister',
    defaultScandal: 'FAKE_CREDENTIALS',
    defaultScandalTitle: 'Forged University Degree & Ghost NYSC Certificate',
    passiveName: 'Court Injunction Machine',
    passiveText: 'Every Target PR counter-offensive (at 20%, 45% and 70% Believers) also adds +10% Heat through frivolous defamation suits, unless countered at the Defense Desk.',
    dossierBlurb: 'A "Toronto-trained" cabinet minister whose certificate nobody at Toronto can find, and whose lawyers file faster than he talks.'
  }
];

export const getTarget = (id: TargetId | string | null | undefined): TargetArchetype =>
  TARGETS.find(t => t.id === id) ?? TARGETS[0];

export interface ScandalInfo {
  category: ScandalCategory;
  label: string;
  tagline: string;
}

export const SCANDALS: Record<ScandalCategory, ScandalInfo> = {
  FINANCIAL: { category: 'FINANCIAL', label: 'Financial', tagline: 'Looted billions and a paper trail that ends offshore.' },
  AFFAIR: { category: 'AFFAIR', label: 'Affair', tagline: 'A secret life, a hidden property, and receipts to match.' },
  LEAKED_MEDIA: { category: 'LEAKED_MEDIA', label: 'Leaked Media', tagline: 'A recording the target never wanted the public to hear.' },
  FAKE_CREDENTIALS: { category: 'FAKE_CREDENTIALS', label: 'Fake Credentials', tagline: 'Degrees, certificates and titles that do not exist.' }
};

export const SCANDAL_CATEGORIES: ScandalCategory[] = ['FINANCIAL', 'AFFAIR', 'LEAKED_MEDIA', 'FAKE_CREDENTIALS'];

export const scandalTitleFor = (target: TargetArchetype, category: ScandalCategory): string =>
  category === target.defaultScandal ? target.defaultScandalTitle : SCANDALS[category].tagline;

// Online hubs that Bot Farm War Chest doubles Spin spawns in (spec §2.3).
export const BOT_FARM_HUBS = ['lagos', 'rivers', 'enugu', 'oyo', 'fct'];

// Replaces the {Target} token used by all channel/evidence flavor text.
export const fillTarget = (text: string, target: TargetArchetype): string =>
  text.replace(/\{Target\}/g, target.shortName);
