import { ScandalCategory } from './channels';
import { PARODY_EVIDENCE } from './parody';
import { STORY_EVIDENCE } from './adult';

export type EvidenceKind = 'VERIFIED' | 'FORGERY';

export interface EvidenceVariant {
  name: string;
  flavor: string[];
}

export interface EvidenceItem {
  id: string;
  kind: EvidenceKind;
  tier?: 1 | 2 | 3 | 4;
  name: string;                 // Spec name, used when no category variant exists
  cost: number;
  requiredInvestigation: number;
  doubtReduction: number;       // % removed from every state's Doubt
  heatIncrease: number;         // % Heat added
  jadedToHeard: number;         // Fraction of Jaded returned to Heard (0..1)
  jadedToBelievers: number;     // Fraction of Jaded converted straight to Believers (0..1)
  heardToBelievers: number;     // Fraction of all Heard converted to Believers (0..1)
  coverUpReduction: number;     // Points removed from the Target's Cover-Up meter
  freshnessBoost: number;       // Points of story Freshness restored
  isFabricated: boolean;
  variants: { DEFAULT: EvidenceVariant } & Partial<Record<ScandalCategory, EvidenceVariant>>;
}

// Parody Targets never get an accusatory file: they get the comic variant.
export const getEvidenceVariant = (item: EvidenceItem, category: ScandalCategory, parody = false, storyOnly = false): EvidenceVariant => {
  if (storyOnly && STORY_EVIDENCE[item.id]) {
    const p = STORY_EVIDENCE[item.id];
    return { name: p.name, flavor: [p.flavor] };
  }
  if (parody && PARODY_EVIDENCE[item.id]) {
    const p = PARODY_EVIDENCE[item.id];
    return { name: p.name, flavor: [p.flavor] };
  }
  return item.variants[category] ?? item.variants.DEFAULT;
};

export const EVIDENCE_DATA: EvidenceItem[] = [
  // ---------------- VERIFIED DOSSIER FILES ----------------
  {
    id: 'ev_tier1_wire',
    kind: 'VERIFIED',
    tier: 1,
    name: 'Redacted Offshore Wire & Call Log',
    cost: 10,
    requiredInvestigation: 25,
    doubtReduction: 18,
    heatIncrease: 8,
    jadedToHeard: 0.25,
    jadedToBelievers: 0,
    heardToBelievers: 0,
    coverUpReduction: 6,
    freshnessBoost: 20,
    isFabricated: false,
    variants: {
      DEFAULT: {
        name: 'Redacted Offshore Wire & Call Log',
        flavor: ['Exposes a 2:14 AM transfer of public funds to a shell company registered under his personal driver\'s name.']
      }
    }
  },
  {
    id: 'ev_tier2_voice_memo',
    kind: 'VERIFIED',
    tier: 2,
    name: 'Whistleblower Audio & Stamped Memo',
    cost: 18,
    requiredInvestigation: 50,
    doubtReduction: 28,
    heatIncrease: 14,
    jadedToHeard: 0.5,
    jadedToBelievers: 0.1,
    heardToBelievers: 0,
    coverUpReduction: 10,
    freshnessBoost: 30,
    isFabricated: false,
    variants: {
      DEFAULT: {
        name: 'Whistleblower Audio & Stamped Memo',
        flavor: ['Secret boardroom recording capturing the target ordering aides to shred audit files and pay off witnesses.']
      }
    }
  },
  {
    id: 'ev_tier3_footage',
    kind: 'VERIFIED',
    tier: 3,
    name: 'Uncensored 4K CCTV & Forensic Audit',
    cost: 28,
    requiredInvestigation: 75,
    doubtReduction: 40,
    heatIncrease: 20,
    jadedToHeard: 0.75,
    jadedToBelievers: 0.2,
    heardToBelievers: 0,
    coverUpReduction: 16,
    freshnessBoost: 45,
    isFabricated: false,
    variants: {
      DEFAULT: {
        name: 'Uncensored 4K CCTV & Forensic Audit',
        flavor: ['Raw, timestamped video footage and bank ledger trails that not even a Senior Advocate can spin.']
      }
    }
  },
  {
    id: 'ev_tier4_smoking_gun',
    kind: 'VERIFIED',
    tier: 4,
    name: 'The Smoking Gun Master Dossier',
    cost: 40,
    requiredInvestigation: 100,
    doubtReduction: 65,
    heatIncrease: 25,
    jadedToHeard: 1,
    jadedToBelievers: 0,
    heardToBelievers: 0.25,
    coverUpReduction: 28,
    freshnessBoost: 70,
    isFabricated: false,
    variants: {
      DEFAULT: {
        name: 'The Smoking Gun Master Dossier',
        flavor: ['Complete BVN trails, international passport stamps, offshore deeds, and signed confessions. An undeniable career obituary.']
      }
    }
  },

  // ---------------- FABRICATED FORGERIES ----------------
  {
    id: 'ev_fake_whatsapp',
    kind: 'FORGERY',
    name: 'Doctored WhatsApp Screenshot',
    cost: 8,
    requiredInvestigation: 0,
    doubtReduction: 22,
    heatIncrease: 12,
    jadedToHeard: 0,
    jadedToBelievers: 0,
    heardToBelievers: 0,
    coverUpReduction: 4,
    freshnessBoost: 10,
    isFabricated: true,
    variants: {
      DEFAULT: {
        name: 'Doctored WhatsApp Screenshot',
        flavor: ['Fabricated chat logs cooked up to look like a confession. Explosive viral bait if the public is gullible, but risky under scrutiny.']
      }
    }
  },
  {
    id: 'ev_deepfake_audio',
    kind: 'FORGERY',
    name: 'AI-Synthesized Voice Leak',
    cost: 15,
    requiredInvestigation: 0,
    doubtReduction: 35,
    heatIncrease: 18,
    jadedToHeard: 0,
    jadedToBelievers: 0,
    heardToBelievers: 0,
    coverUpReduction: 6,
    freshnessBoost: 15,
    isFabricated: true,
    variants: {
      DEFAULT: {
        name: 'AI-Synthesized Voice Leak',
        flavor: ['Deepfake audio of the target mocking ordinary citizens. Massive shock value, though digital forensics can expose the audio artifacts.']
      }
    }
  }
];

export const getEvidence = (id: string): EvidenceItem | undefined => EVIDENCE_DATA.find(e => e.id === id);
export const VERIFIED_EVIDENCE = EVIDENCE_DATA.filter(e => e.kind === 'VERIFIED');
export const FORGERY_EVIDENCE = EVIDENCE_DATA.filter(e => e.kind === 'FORGERY');
