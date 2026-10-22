import { GameAlert, GameState } from './types';
import { ScandalCategory } from './data/channels';
import { EvidenceItem, getEvidenceVariant } from './data/evidence';
import { DefenseItem } from './data/defense';
import { TargetArchetype, fillTarget, getTarget } from './data/targets';
import { POWER_HUBS, ZONE_IDS, ZONE_NAMES, ZONE_STATE_IDS } from './data/zones';
import { getChannel, nationalAverageDoubt, nationalBelieverPct } from './selectors';

let alertCounter = 0;
const uid = (prefix: string) => `${prefix}_${Date.now()}_${alertCounter++}`;

// Player-initiated alerts (priority 100) jump the queue; everything else waits its turn.
export const pushAlert = (queue: GameAlert[], alert: GameAlert | null): GameAlert[] => {
  if (!alert) return queue;
  return alert.priority >= 100 ? [alert, ...queue] : [...queue, alert];
};

// ---------------------------------------------------------------------------
// Mechanical effects attached to background milestones
// ---------------------------------------------------------------------------
export interface MilestoneEffect {
  doubtAll?: number; // Added to every state's Doubt
  heat?: number;     // Added to Heat
  spin?: number;     // Spin bubbles spawned
}

const COUNTER_OFFENSIVES: Record<string, MilestoneEffect> = {
  TARGET_PR_20: { doubtAll: 8, spin: 2 },
  TARGET_PR_45: { doubtAll: 12, spin: 3 },
  TARGET_PR_70: { heat: 15, spin: 3 }
};

// Hon. Danjuma's "Court Injunction Machine": +10% Heat on every counter-offensive unless the
// player already holds a SAN Counter-Injunction.
export const milestoneEffect = (milestoneId: string, state: Pick<GameState, 'activeTargetId' | 'defensePurchases'>): MilestoneEffect | null => {
  const base = COUNTER_OFFENSIVES[milestoneId];
  if (!base) return null;
  const effect: MilestoneEffect = { ...base };
  if (state.activeTargetId === 'minister' && !(state.defensePurchases['san_injunction'] > 0)) {
    effect.heat = (effect.heat ?? 0) + 10;
  }
  return effect;
};

const effectSubtext = (effect: MilestoneEffect): string => {
  const parts: string[] = [];
  if (effect.doubtAll) parts.push(`+${effect.doubtAll}% Nationwide Doubt`);
  if (effect.heat) parts.push(`+${effect.heat}% Heat`);
  if (effect.spin) parts.push(`${effect.spin} Spin Bubbles on the map: shatter them!`);
  return parts.join(' • ');
};

// ---------------------------------------------------------------------------
// Player-initiated alerts
// ---------------------------------------------------------------------------
export const AlertFactory = {
  // Seed pop (Day 1): STREET_WHISPER
  createSeedAlert: (stateName: string, target: TargetArchetype): GameAlert => ({
    id: uid('seed'),
    archetype: 'STREET_WHISPER',
    stampText: 'GROUND ZERO // FIRST WHISPER',
    headline: `Loose Lips in ${stateName}`,
    body: `"An agbero at a motor park in ${stateName} just overheard a wild rumor about ${target.shortName}. The conductor is already shouting it to the whole bus..."`,
    subtext: 'Contagion Active • Clock Started',
    buttonText: 'Fan the Flames',
    priority: 100
  }),

  // Channel acquired: Street/Social => VIRAL_RECEIPT, Press/Elite => BREAKING_FRONT
  createChannelAlert: (channelId: string, category: ScandalCategory, target: TargetArchetype): GameAlert | null => {
    const channel = getChannel(channelId);
    if (!channel) return null;
    const isPressOrElite = channel.branch === 'PRESS' || channel.branch === 'ELITE';
    const lines = channel.flavorTexts[category] ?? channel.flavorTexts.DEFAULT;
    const matched = channel.synergy.includes(category);
    return {
      id: uid(`chan_${channel.id}`),
      archetype: isPressOrElite ? 'BREAKING_FRONT' : 'VIRAL_RECEIPT',
      stampText: isPressOrElite ? `${channel.branch} SYNDICATION` : 'VIRAL GIST ALERT',
      headline: channel.name,
      body: `"${fillTarget(lines[0], target)}"`,
      subtext: `Velocity +${channel.velocity} • Credibility +${channel.credibility} • Notoriety +${channel.notoriety}${matched ? ' • SYNERGY x1.35' : ''}`,
      buttonText: 'Keep Pushing',
      priority: 100
    };
  },

  // Evidence leaked: genuine => BREAKING_FRONT, forgery success => VIRAL_RECEIPT, exposed => TARGET_PR
  createEvidenceAlert: (item: EvidenceItem, backfired: boolean, category: ScandalCategory, target: TargetArchetype): GameAlert => {
    const variant = getEvidenceVariant(item, category);
    if (backfired) {
      return {
        id: uid(`ev_backfire_${item.id}`),
        archetype: 'TARGET_PR',
        stampText: 'FORENSIC DEBUNK // BACKFIRE!',
        headline: `Fake "${variant.name}" Exposed!`,
        body: `"Independent metadata analysts and ${target.shortName}'s legal team just proved your leaked file was doctored. The streets are calling your operation a paid smear job!"`,
        subtext: '+20% National Doubt • +25% Heat',
        buttonText: 'Damage Control',
        priority: 100
      };
    }
    return {
      id: uid(`ev_${item.id}`),
      archetype: item.isFabricated ? 'VIRAL_RECEIPT' : 'BREAKING_FRONT',
      stampText: item.isFabricated ? 'UNVERIFIED RECEIPT DROPPED' : 'HARD EVIDENCE LEAKED',
      headline: `${variant.name} Hits the Timeline`,
      body: item.isFabricated
        ? '"Nobody is checking the metadata! The doctored file is flying across WhatsApp groups and skepticism is crumbling."'
        : `"${fillTarget(variant.flavor[0], target)} Screenshot after screenshot is circulating, silencing the defenders."`,
      subtext: `-${item.doubtReduction}% Doubt • +${item.heatIncrease}% Heat`,
      buttonText: 'Watch Them Sweat',
      priority: 100
    };
  },

  // Defense purchased: SECURITY_WIRE
  createDefenseAlert: (item: DefenseItem): GameAlert => ({
    id: uid(`def_${item.id}`),
    archetype: 'SECURITY_WIRE',
    stampText: 'OPSEC PROTOCOL // EXECUTED',
    headline: item.name,
    body: item.alertBody,
    subtext: `-${item.heatReduction}% Heat${item.id === 'proxy_relay' ? ' • Notoriety Heat -25%' : ''}${item.id === 'san_injunction' ? ' • Spin Bubbles Neutralized' : ''}${item.id === 'whistleblower' ? ' • Investigation +11%/day' : ''}`,
    buttonText: 'Stay in the Shadows',
    priority: 100
  }),

  // -------------------------------------------------------------------------
  // Background tick audit. Returns at most ONE alert: the highest-priority untriggered milestone.
  // -------------------------------------------------------------------------
  evaluateTickTriggers: (next: GameState): { alert: GameAlert; milestoneId: string } | null => {
    const target = getTarget(next.activeTargetId);
    const candidates: { alert: GameAlert; milestoneId: string }[] = [];
    const triggered = new Set(next.triggeredMilestones);
    const tryQueue = (milestoneId: string, alert: GameAlert) => {
      if (!triggered.has(milestoneId)) candidates.push({ milestoneId, alert });
    };

    const states = next.states;
    const believerPct = nationalBelieverPct(states);
    const avgDoubt = nationalAverageDoubt(states);

    // --- A. CLOCK ---
    if (next.currentDay >= 10 && next.currentDay < 17) {
      tryQueue('CLOCK_HALFWAY', {
        id: 'clock_10', archetype: 'BREAKING_FRONT', stampText: 'EDITORIAL DESK // DAY 10',
        headline: 'Attention Span Warning',
        body: '"Half the timeline has elapsed. In Nigeria, a scandal only lasts two weeks before the next distraction drops. Escalate now or the story dies."',
        subtext: '10 Days Remaining', buttonText: 'Step on the Gas', priority: 50
      });
    }
    if (next.currentDay >= 17 && next.currentDay <= next.dayBudget) {
      tryQueue('CLOCK_FINAL', {
        id: 'clock_17', archetype: 'BREAKING_FRONT', stampText: 'URGENT // 72 HOURS LEFT',
        headline: 'News Cycle Fading Fast',
        body: '"72 hours until the public moves on! Drop your hardest receipts and buy elite press coverage immediately."',
        subtext: '3 Days Remaining', buttonText: 'Final Push', priority: 75
      });
    }

    // --- B. INVESTIGATION TIERS ---
    [25, 50, 75, 100].forEach(tier => {
      if (next.investigationProgress >= tier) {
        tryQueue(`INV_${tier}`, {
          id: `inv_${tier}`, archetype: 'INFORMANT_TIP', stampText: `INSIDER DROP // TIER ${tier / 25}`,
          headline: tier === 100 ? 'The Smoking Gun Is Yours' : 'New Classified Files Unlocked',
          body: tier === 100
            ? '"Everything. Every signature, every transfer, every call. The master file is sitting in your Evidence Locker right now."'
            : '"Check your Evidence Locker. A source inside the secretariat just slid a fresh batch of unredacted documents under the door."',
          subtext: `Investigation at ${tier}% • Evidence Tier ${tier / 25} Ready`, buttonText: 'Open Locker Later', priority: 60
        });
      }
    });

    // --- C. MAP & CONTAGION ---
    const hubNames: Record<string, { name: string; desc: string }> = {
      lagos: { name: 'Lagos', desc: 'the commercial nerve center and media megaphones' },
      fct: { name: 'FCT (Abuja)', desc: 'the corridors of federal power and ministry lounges' },
      kano: { name: 'Kano', desc: 'the northern commercial hub and radio networks' },
      rivers: { name: 'Rivers', desc: 'the oil capital and Niger Delta street networks' }
    };
    POWER_HUBS.forEach(hubId => {
      const s = states[hubId];
      const hub = hubNames[hubId];
      if (s && hub && s.heard > 0 && next.startingStateId !== hubId) {
        tryQueue(`HUB_${hubId}`, {
          id: `hub_${hubId}`, archetype: 'STREET_WHISPER', stampText: 'CONTAGION BREACH // MAJOR HUB',
          headline: `Rumor Hits ${hub.name}!`,
          body: `"The gist has crossed state lines into ${hub.name}, infiltrating ${hub.desc}."`,
          subtext: `${hub.name} Infected`, buttonText: 'Watch It Spread', priority: 55
        });
      }
    });

    // Regional Sweep: every state in a geopolitical zone has heard the rumor
    ZONE_IDS.forEach(zone => {
      const ids = ZONE_STATE_IDS[zone];
      if (ids.length > 0 && ids.every(id => states[id] && (states[id].heard + states[id].believers) > 0)) {
        tryQueue(`SWEEP_${zone}`, {
          id: `sweep_${zone}`, archetype: 'STREET_WHISPER', stampText: `REGIONAL SWEEP // ${ZONE_NAMES[zone].toUpperCase()}`,
          headline: `${ZONE_NAMES[zone]} Fully Infected!`,
          body: `"From the first motor park to the last village square, every state in the ${ZONE_NAMES[zone]} is now talking about ${target.shortName}. There is nowhere left to hide in the zone."`,
          subtext: `${ids.length}/${ids.length} States in ${ZONE_NAMES[zone]} Reached`, buttonText: 'Sweep the Nation', priority: 62
        });
      }
    });

    // First State Flip
    const flipped = Object.values(states).find(s => s.population > 0 && s.believers / s.population >= 0.5);
    if (flipped) {
      tryQueue('FIRST_STATE_FLIP', {
        id: 'state_flip_50', archetype: 'BREAKING_FRONT', stampText: 'TIPPING POINT',
        headline: `${flipped.name} Fully Convinced!`,
        body: `"Over half the population in ${flipped.name} now believes the scandal is 100% true. Street debates have turned into open outrage."`,
        subtext: `${flipped.name} > 50% Believers`, buttonText: 'Domino Effect', priority: 65
      });
    }

    // Nationwide Critical Mass
    [
      { p: 25, title: 'National Conversation', msg: '"One in four Nigerians now believes the dossier. Mainstream TV hosts can no longer ignore the elephant in the room."' },
      { p: 50, title: 'Half the Country Convinced!', msg: '"50% of the nation is demanding answers. Memes, sermons, and newspaper editorials are all locked on the target."' },
      { p: 80, title: 'Regime-Shaking Outrage!', msg: '"80% national conviction! Allies are deleting old photos with the target and crisis meetings are happening behind closed doors."' }
    ].forEach(m => {
      if (believerPct >= m.p) {
        tryQueue(`MASS_${m.p}`, {
          id: `mass_${m.p}`, archetype: 'BREAKING_FRONT', stampText: `CRITICAL MASS // ${m.p}% BELIEVERS`,
          headline: m.title, body: m.msg, subtext: `${m.p}% Nationwide Conviction`, buttonText: 'Press the Advantage', priority: 70
        });
      }
    });

    // --- D. TARGET AI ---
    if (avgDoubt >= 65) {
      tryQueue('HIGH_DOUBT_65', {
        id: 'doubt_65', archetype: 'TARGET_PR', stampText: 'SKEPTICISM SPIKE // 65% DOUBT',
        headline: 'The Streets Are Calling Cap!',
        body: '"You are pushing talk without receipts! The streets are calling cap. Drop receipts immediately or people will decide this is a paid political hatchet job."',
        subtext: 'Leak Evidence Immediately to Crush Doubt', buttonText: 'Understood', priority: 78
      });
    }

    const offensive = (id: string, at: number, stamp: string, headline: string, body: string, button: string, priority: number) => {
      if (believerPct < at) return;
      const effect = milestoneEffect(id, next);
      tryQueue(id, {
        id: id.toLowerCase(), archetype: 'TARGET_PR', stampText: stamp, headline, body,
        subtext: effect ? `Target Counter-Move: ${effectSubtext(effect)}` : undefined, buttonText: button, priority
      });
    };
    offensive('TARGET_PR_20', 20, 'OFFICIAL PRESS RELEASE // FAKE NEWS DENIAL', '"Ignore the Jobless Detractors!"',
      `"${target.shortName}'s office has issued a 4-page press statement claiming all allegations are AI-generated deepfakes sponsored by enemies of progress."`,
      'Counter With Receipts', 72);
    offensive('TARGET_PR_45', 45, 'CRISIS PR // WAR CHEST DEPLOYED', 'Paid Influencers Flood Timeline',
      `"${target.shortName} just wired millions to top PR firms and defensive influencers to trend #StandWithOurLeader and muddy the waters."`,
      'Expose Them', 74);
    offensive('TARGET_PR_70', 70, 'DESPERATION MOVE // SYMPATHY PLAY', 'Target Spotted in Neck Brace!',
      `"Cornered by the scandal, ${target.shortName} was just photographed being wheeled into a private clinic in London with a sudden 'mystery ailment' while threatening a ₦10 Billion lawsuit."`,
      'No Mercy', 76);

    // --- E. HEAT ---
    if (next.heat >= 40) {
      tryQueue('HEAT_40', {
        id: 'heat_40', archetype: 'SECURITY_WIRE', stampText: 'CYBERCRIME UNIT // WIRE',
        headline: 'IP Logs Under Review',
        body: '"A formal petition has landed on the desk of the Cybercrime Unit. Analysts have begun logging ISP traffic to trace the origin of the leaks."',
        subtext: 'Heat at 40% • Monitor Your Trail', buttonText: 'Acknowledge', priority: 82
      });
    }
    if (next.heat >= 70) {
      tryQueue('HEAT_70', {
        id: 'heat_70', archetype: 'SECURITY_WIRE', stampText: 'REGULATOR CLAMPDOWN // 70% HEAT',
        headline: 'Telecom Throttle & Account Freeze!',
        body: '"Authorities are pressuring telecoms to throttle suspicious blog traffic and freezing burner bank accounts connected to anonymous whistleblowers."',
        subtext: 'Heat at 70% • Deploy Defense Soon', buttonText: 'Tighten Security', priority: 85
      });
    }
    if (next.heat >= 90) {
      tryQueue('HEAT_90', {
        id: 'heat_90', archetype: 'SECURITY_WIRE', stampText: 'CRITICAL // DSS TRACKING VANS',
        headline: 'Signal Triangulated!',
        body: '"Unmarked Hilux vans are parked outside your safehouse! If Heat hits 100%, your door gets kicked in. Open the Defense Desk NOW!"',
        subtext: 'DANGER: 90% HEAT', buttonText: 'Emergency Protocol', priority: 95
      });
    }

    if (candidates.length === 0) return null;
    candidates.sort((a, b) => b.alert.priority - a.alert.priority);
    return candidates[0];
  }
};

