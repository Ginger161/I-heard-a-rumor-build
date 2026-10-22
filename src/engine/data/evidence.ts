export interface EvidenceItem {
  id: string;
  name: string;
  cost: number;
  doubtReduction: number;
  heatIncrease: number;
  requiredInvestigation: number;
  isFabricated?: boolean;
  flavorText?: string;
}

export const EVIDENCE_DATA: EvidenceItem[] = [
  {
    id: 'ev_bank_slip',
    name: 'Leaked Offshore Bank Transfer',
    cost: 15,
    doubtReduction: 15,
    heatIncrease: 10,
    requiredInvestigation: 0,
    isFabricated: false,
    flavorText: 'A crumpled transaction slip from a Cayman Islands holding firm.'
  },
  {
    id: 'ev_voice_note',
    name: 'Intercepted WhatsApp Audio Memo',
    cost: 20,
    doubtReduction: 20,
    heatIncrease: 15,
    requiredInvestigation: 0,
    isFabricated: false,
    flavorText: 'A frantic 30-second audio note instructing bags of cash to be moved.'
  },
  {
    id: 'ev_fake_manifest',
    name: 'Altered Private Jet Manifest',
    cost: 18,
    doubtReduction: 25,
    heatIncrease: 25,
    requiredInvestigation: 0,
    isFabricated: true,
    flavorText: 'Doctored flight documents placing the target in Dubai during the crisis.'
  },
  {
    id: 'ev_shell_company',
    name: 'CAC Shell Company Registry',
    cost: 30,
    doubtReduction: 30,
    heatIncrease: 20,
    requiredInvestigation: 20,
    isFabricated: false,
    flavorText: 'Corporate Affairs Commission filing tying luxury estates to a front company.'
  },
  {
    id: 'ev_cctv_footage',
    name: 'Grainy VIP Lounge CCTV Reel',
    cost: 35,
    doubtReduction: 35,
    heatIncrease: 25,
    requiredInvestigation: 40,
    isFabricated: false,
    flavorText: 'Timestamped surveillance tape showing the midnight cash handover.'
  },
  {
    id: 'ev_whistleblower',
    name: 'Ex-Personal Assistant Affidavit',
    cost: 45,
    doubtReduction: 40,
    heatIncrease: 30,
    requiredInvestigation: 60,
    isFabricated: false,
    flavorText: 'A sworn statement detailing burner phones and off-the-books bribes.'
  },
  {
    id: 'ev_redacted_dossier',
    name: 'Unredacted EFCC Secret Dossier',
    cost: 60,
    doubtReduction: 50,
    heatIncrease: 40,
    requiredInvestigation: 75,
    isFabricated: false,
    flavorText: 'The smoking gun: an anti-graft commission file buried by high command.'
  }
];
