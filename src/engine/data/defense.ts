export type DefenseId = 'burner_sim' | 'proxy_relay' | 'san_injunction' | 'whistleblower' | 'safehouse';

export interface DefenseItem {
  id: DefenseId;
  name: string;
  cost: number;
  maxUses: number;          // 1 = one-time
  heatReduction: number;    // Immediate % Heat removed
  effectText: string;       // Extra permanent/instant effect, shown on the card
  alertBody: string;
  emergency?: boolean;
}

export const DEFENSE_DATA: DefenseItem[] = [
  {
    id: 'burner_sim',
    name: 'Burner SIM & IMEI Scrub',
    cost: 12,
    maxUses: 3,
    heatReduction: 18,
    effectText: 'Immediate -18% Heat. Repeatable up to 3 times.',
    alertBody: '"A fresh bag of unregistered SIMs from Computer Village, handsets re-flashed, IMEIs scrubbed. The old trail just went cold."'
  },
  {
    id: 'proxy_relay',
    name: 'Encrypted Proxy & Darknet Relay',
    cost: 20,
    maxUses: 1,
    heatReduction: 15,
    effectText: 'Immediate -15% Heat. Permanently cuts daily Notoriety Heat gain by 25% and halves Target heat surges.',
    alertBody: '"Traffic is now bouncing through three offshore relays. Cybercrime analysts see only static where your uploads used to be."'
  },
  {
    id: 'san_injunction',
    name: 'Senior Advocate (SAN) Counter-Injunction',
    cost: 25,
    maxUses: 1,
    heatReduction: 20,
    effectText: 'Immediate -20% Heat. Neutralizes every Spin bubble, thaws frozen channels, and blocks the next 2 injunctions.',
    alertBody: '"A Senior Advocate walked into the Federal High Court at 8:01 AM and had the Target\'s gag order set aside before the tea went cold."'
  },
  {
    id: 'whistleblower',
    name: 'Ministry Whistleblower Retainer',
    cost: 28,
    maxUses: 1,
    heatReduction: 15,
    effectText: 'Immediate -15% Heat. Investigation speed nearly doubles (+3.6%/day to +6.6%/day).',
    alertBody: '"A director inside the ministry has agreed to leak on a monthly retainer. New files will reach your locker faster."'
  },
  {
    id: 'safehouse',
    name: 'Emergency Safehouse Relocation',
    cost: 40,
    maxUses: 1,
    heatReduction: 45,
    effectText: 'Immediate -45% Heat. The panic button for when DSS vans reach 90%.',
    alertBody: '"Laptops in a Ghana-Must-Go bag, a night bus to a different state, a new landlord who asks no questions. DSS vans are staking out an empty room."',
    emergency: true
  }
];

export const getDefense = (id: string): DefenseItem | undefined => DEFENSE_DATA.find(d => d.id === id);
