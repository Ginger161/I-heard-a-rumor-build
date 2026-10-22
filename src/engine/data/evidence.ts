import { ScandalCategory } from './channels';

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
  isFabricated: boolean;
  variants: { DEFAULT: EvidenceVariant } & Partial<Record<ScandalCategory, EvidenceVariant>>;
}

export const getEvidenceVariant = (item: EvidenceItem, category: ScandalCategory): EvidenceVariant =>
  item.variants[category] ?? item.variants.DEFAULT;

export const EVIDENCE_DATA: EvidenceItem[] = [
  // ---------------- VERIFIED DOSSIER FILES ----------------
  {
    id: 'ev_tier1_wire',
    kind: 'VERIFIED',
    tier: 1,
    name: 'Redacted Wire / Call Log Snippet',
    cost: 10,
    requiredInvestigation: 25,
    doubtReduction: 18,
    heatIncrease: 8,
    jadedToHeard: 0.25,
    jadedToBelievers: 0,
    heardToBelievers: 0,
    isFabricated: false,
    variants: {
      DEFAULT: { name: 'Redacted Wire / Call Log Snippet', flavor: ['A half-blacked-out call log showing the target phoning people he swore he never knew.'] },
      FINANCIAL: { name: 'Leaked Offshore Bank Transfer', flavor: ['A crumpled transaction slip from a Cayman Islands holding firm.'] },
      AFFAIR: { name: 'Hotel Check-In Call Log', flavor: ['Forty-one calls to the same number between 11 PM and 3 AM, all from a Maitama hotel line.'] },
      LEAKED_MEDIA: { name: 'Metadata Log of the Leaked Clip', flavor: ['A server log proving the video was uploaded from the target\'s own office network.'] },
      FAKE_CREDENTIALS: { name: 'Registrar Call Record', flavor: ['A phone log of the target calling a registrar\'s office to "arrange" a transcript.'] }
    }
  },
  {
    id: 'ev_tier2_voice_memo',
    kind: 'VERIFIED',
    tier: 2,
    name: 'Insider Voice Note & Stamped Memo',
    cost: 18,
    requiredInvestigation: 50,
    doubtReduction: 28,
    heatIncrease: 14,
    jadedToHeard: 0.5,
    jadedToBelievers: 0.1,
    heardToBelievers: 0,
    isFabricated: false,
    variants: {
      DEFAULT: { name: 'Insider Voice Note & Stamped Memo', flavor: ['A nervous voice note from a staffer, backed by a memo carrying a real ministry stamp.'] },
      FINANCIAL: {
        name: 'Intercepted WhatsApp Audio Memo',
        flavor: [
          'A frantic 30-second audio note instructing bags of cash to be moved.',
          'A sworn statement detailing burner phones and off-the-books bribes.'
        ]
      },
      AFFAIR: { name: 'Mistress Voice Note & Lease Memo', flavor: ['A tearful voice note begging the target to "stop pretending", plus a stamped lease for the Cyprus villa.'] },
      LEAKED_MEDIA: { name: 'Studio Engineer Voice Note', flavor: ['The sound engineer who cleaned the audio confirms in his own voice that the target never asked him to delete it.'] },
      FAKE_CREDENTIALS: { name: 'Clerk Voice Note & Stamped Query', flavor: ['A records clerk admits on tape that no file exists, and a stamped "no record found" query backs her up.'] }
    }
  },
  {
    id: 'ev_tier3_footage',
    kind: 'VERIFIED',
    tier: 3,
    name: 'Uncensored HD Footage / Forensic Audit',
    cost: 28,
    requiredInvestigation: 75,
    doubtReduction: 40,
    heatIncrease: 20,
    jadedToHeard: 0.75,
    jadedToBelievers: 0.2,
    heardToBelievers: 0,
    isFabricated: false,
    variants: {
      DEFAULT: { name: 'Uncensored HD Footage / Forensic Audit', flavor: ['Crisp, timestamped footage and a forensic audit that no lawyer can wave away.'] },
      FINANCIAL: {
        name: 'Grainy VIP Lounge CCTV Reel & CAC Registry',
        flavor: [
          'Timestamped surveillance tape showing the midnight cash handover.',
          'Corporate Affairs Commission filing tying luxury estates to a front company.'
        ]
      },
      AFFAIR: { name: 'Uncensored Villa Gate Footage', flavor: ['Clean HD footage from the villa\'s own security cameras, date and time burned into the corner.'] },
      LEAKED_MEDIA: { name: 'Forensic Audio Authentication Report', flavor: ['An independent lab certifies the leaked recording as unedited, down to the background generator hum.'] },
      FAKE_CREDENTIALS: { name: 'University Forensic Records Audit', flavor: ['A full forensic audit of the university\'s admissions archive finds no trace of the target, in any year.'] }
    }
  },
  {
    id: 'ev_tier4_smoking_gun',
    kind: 'VERIFIED',
    tier: 4,
    name: 'The Smoking Gun Master File',
    cost: 40,
    requiredInvestigation: 100,
    doubtReduction: 65,
    heatIncrease: 25,
    jadedToHeard: 1,
    jadedToBelievers: 0,
    heardToBelievers: 0.25,
    isFabricated: false,
    variants: {
      DEFAULT: { name: 'The Smoking Gun Master File', flavor: ['Everything, in one folder, with signatures. The kind of file that ends careers.'] },
      FINANCIAL: { name: 'Unredacted EFCC Secret Dossier', flavor: ['The smoking gun: an anti-graft commission file buried by high command.'] },
      AFFAIR: { name: 'The Complete Entanglement Dossier', flavor: ['Photos, receipts, tapes and a notarized statement from the spouse, bound in one folder marked "DO NOT RELEASE".'] },
      LEAKED_MEDIA: { name: 'The Full Uncut Original Recording', flavor: ['The complete, unedited original with the target\'s own laughter, plus the phone it was recorded on.'] },
      FAKE_CREDENTIALS: { name: 'Joint Registrar & NYSC Denial File', flavor: ['Signed denials from the university and the NYSC directorate, side by side with the forged certificates.'] }
    }
  },

  // ---------------- FABRICATED FORGERIES ----------------
  {
    id: 'ev_fake_whatsapp',
    kind: 'FORGERY',
    name: 'Doctored WhatsApp Receipt',
    cost: 8,
    requiredInvestigation: 0,
    doubtReduction: 22,
    heatIncrease: 12,
    jadedToHeard: 0,
    jadedToBelievers: 0,
    heardToBelievers: 0,
    isFabricated: true,
    variants: {
      DEFAULT: { name: 'Doctored WhatsApp Receipt', flavor: ['A screenshot of a chat that looks right at first glance and wrong at second.'] },
      FINANCIAL: { name: 'Altered Private Jet Manifest', flavor: ['Doctored flight documents placing the target in Dubai during the crisis.'] },
      AFFAIR: { name: 'Doctored Chat Screenshot', flavor: ['A "leaked" chat between the target and a mistress, fonts almost right, timestamps almost consistent.'] },
      LEAKED_MEDIA: { name: 'Doctored Transcript Screenshot', flavor: ['A typed "transcript" of the recording, stitched together from three different interviews.'] },
      FAKE_CREDENTIALS: { name: 'Doctored Admission Letter', flavor: ['A photoshopped admission letter that "proves" the target was never enrolled. The seal is slightly off-centre.'] }
    }
  },
  {
    id: 'ev_deepfake_audio',
    kind: 'FORGERY',
    name: 'Deepfake Audio Leak',
    cost: 15,
    requiredInvestigation: 0,
    doubtReduction: 35,
    heatIncrease: 18,
    jadedToHeard: 0,
    jadedToBelievers: 0,
    heardToBelievers: 0,
    isFabricated: true,
    variants: {
      DEFAULT: { name: 'Deepfake Audio Leak', flavor: ['An AI-cloned voice note that sounds exactly like the target, saying exactly what you need.'] },
      FINANCIAL: { name: 'Deepfake "Share the Loot" Call', flavor: ['A cloned voice instructs an aide to "share the money before EFCC arrives". Convincing, until someone checks the metadata.'] },
      AFFAIR: { name: 'Deepfake Pillow-Talk Recording', flavor: ['A synthetic bedroom conversation in the target\'s voice. The breathing is a little too regular.'] },
      LEAKED_MEDIA: { name: 'Deepfake "Second Take" Audio', flavor: ['A fabricated follow-up recording where the target repeats the leaked confession in a different room.'] },
      FAKE_CREDENTIALS: { name: 'Deepfake Confession to a Friend', flavor: ['A cloned voice admits, "Nobody checks those certificates anyway." Nobody had said that. Yet.'] }
    }
  }
];

export const getEvidence = (id: string): EvidenceItem | undefined => EVIDENCE_DATA.find(e => e.id === id);
export const VERIFIED_EVIDENCE = EVIDENCE_DATA.filter(e => e.kind === 'VERIFIED');
export const FORGERY_EVIDENCE = EVIDENCE_DATA.filter(e => e.kind === 'FORGERY');
