import { GameAlert, GameState } from './types';
import { ScandalCategory } from './data/channels';
import { EvidenceItem, getEvidenceVariant } from './data/evidence';
import { channelFlavorLine } from './data/flavor';
import { DefenseItem } from './data/defense';
import { AbilityDef, STYLE_MULTIPLIERS, TargetArchetype, fillTarget, getTarget, temperamentMods } from './data/targets';
import { POWER_HUBS, ZONE_IDS, ZONE_NAMES, ZONE_STATE_IDS } from './data/zones';
import { getChannel, nationalAverageDoubt, nationalBelieverPct } from './selectors';
import { Effect } from './effects';
import { BALANCE } from './balance';
import { SCHEMER_EVENT, buildEventAlert } from './events';
import { getClimate } from './data/climates';
import { COPY, pickCopy, pickFrom } from './data/copy';

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
const COUNTER_OFFENSIVES: Record<string, Effect[]> = {
  TARGET_PR_20: [{ kind: 'doubtAll', amount: 8 }, { kind: 'coverUp', amount: 4 }, { kind: 'spin', count: 2 }],
  TARGET_PR_45: [{ kind: 'doubtAll', amount: 12 }, { kind: 'coverUp', amount: 5 }, { kind: 'spin', count: 3 }],
  TARGET_PR_70: [{ kind: 'heat', amount: 15 }, { kind: 'coverUp', amount: 6 }, { kind: 'spin', count: 3 }],
  // THE_STOIC: all the pressure it withheld, delivered at once.
  STOIC_AMBUSH: [{ kind: 'doubtAll', amount: 14 }, { kind: 'coverUp', amount: 10 }, { kind: 'heat', amount: 10 }, { kind: 'spin', count: 4 }]
};

// THE_CRASHOUT: a public meltdown. It hands the player momentum, but sets the PR machine on fire.
const CRASHOUT_EFFECTS: Effect[] = [
  { kind: 'timed', effectKind: 'VELOCITY_MULT', days: BALANCE.crashoutBoostDays, mult: BALANCE.crashoutVelocityBoost, label: 'Meltdown backlash' },
  { kind: 'spin', count: BALANCE.crashoutSpin }
];

// Good news keeps the story alive: bonuses applied when a positive milestone fires.
const FRESHNESS_BONUS: Record<string, number> = {
  FIRST_STATE_FLIP: 15, MASS_25: 10, MASS_50: 10, MASS_80: 15,
  SWEEP_SW: 10, SWEEP_SE: 10, SWEEP_SS: 10, SWEEP_NC: 10, SWEEP_NE: 10, SWEEP_NW: 10,
  HUB_lagos: 6, HUB_fct: 6, HUB_kano: 6, HUB_rivers: 6
};

export const milestoneEffect = (
  milestoneId: string,
  state: Pick<GameState, 'activeTargetId' | 'defensePurchases'>
): Effect[] | null => {
  if (milestoneId === 'CRASHOUT') return CRASHOUT_EFFECTS.map(e => ({ ...e })) as Effect[];
  const base = COUNTER_OFFENSIVES[milestoneId];
  if (base) {
    const effects = base.map(e => ({ ...e })) as Effect[];
    // A SAN counter-injunction cancels frivolous-lawsuit heat (e.g. Hon. Danjuma).
    const extra = getTarget(state.activeTargetId).mods.counterHeat ?? 0;
    if (extra > 0 && !(state.defensePurchases['san_injunction'] > 0)) effects.push({ kind: 'heat', amount: extra });
    return effects;
  }
  const fresh = FRESHNESS_BONUS[milestoneId];
  return fresh ? [{ kind: 'freshness', amount: fresh }] : null;
};

export const effectSubtext = (effects: Effect[]): string => {
  const parts: string[] = [];
  let heat = 0, doubt = 0, cover = 0, spin = 0;
  effects.forEach(e => {
    if (e.kind === 'heat') heat += e.amount;
    if (e.kind === 'doubtAll') doubt += e.amount;
    if (e.kind === 'coverUp') cover += e.amount;
    if (e.kind === 'spin') spin += e.count;
  });
  if (doubt) parts.push(`+${doubt}% Nationwide Doubt`);
  if (heat) parts.push(`+${heat}% Heat`);
  if (cover) parts.push(`+${cover}% Cover-Up`);
  if (spin) parts.push(`${spin} Spin Bubbles on the map: shatter them!`);
  effects.forEach(e => {
    if (e.kind === 'timed' && e.effectKind === 'VELOCITY_MULT') parts.push(`+${Math.round((e.mult - 1) * 100)}% Velocity for ${e.days} days`);
  });
  return parts.join(' • ');
};

// A Target's temperament and defense style reshape how hard its abilities hit.
export const scaledStrength = (a: AbilityDef, target: TargetArchetype): number => {
  const style = STYLE_MULTIPLIERS[target.ai.defenseStyle];
  const t = temperamentMods(target);
  let s = a.strength * t.abilityStrength;
  if (a.kind === 'DISTRACTION') s *= style.distraction;
  if (a.kind === 'INJUNCTION') s += style.injunctionDays;
  return Math.max(1, Math.round(s));
};

// Target abilities -> effects (the sim applies them and then builds the alert with the outcome notes).
export const abilityEffects = (a: AbilityDef, state: Pick<GameState, 'defensePurchases' | 'activeTargetId'>): Effect[] => {
  const strength = scaledStrength(a, getTarget(state.activeTargetId));
  switch (a.kind) {
    case 'INJUNCTION': return [{ kind: 'freeze', days: strength, branch: a.branch }];
    case 'DISTRACTION': return [{ kind: 'freshness', amount: -strength }];
    case 'HEAT_SURGE': return [{ kind: 'heat', amount: state.defensePurchases['proxy_relay'] > 0 ? Math.ceil(strength / 2) : strength }];
    case 'COUNTER_STORY': return [{ kind: 'coverUp', amount: strength }];
    case 'BOT_SWARM': return [{ kind: 'spin', count: strength }];
    case 'DOUBT_WAVE': return [{ kind: 'doubtAll', amount: strength }];
    case 'EVIDENCE_RAID': return [{ kind: 'investigation', amount: -strength }];
    case 'ACCOUNT_FREEZE': return [{ kind: 'sparks', amount: -strength }];
    case 'ROADBLOCK': return [{ kind: 'timed', effectKind: 'HIGHWAY_MULT', days: strength, mult: 0.5, label: 'Roadblocks' }];
    case 'LANE_JAM': return [{ kind: 'timed', effectKind: 'BRANCH_MULT', days: strength, mult: 0.6, label: 'Jammed', branch: a.branch ?? 'SOCIAL' }];
    case 'REGION_LOCK': return [{ kind: 'timed', effectKind: 'ZONE_FRICTION', days: strength, mult: 0.5, label: 'Lockdown', zone: a.zone ?? 'SW' }];
  }
};

const abilitySubtext = (a: AbilityDef, target: TargetArchetype, state: Pick<GameState, 'defensePurchases'>, notes: string[]): string => {
  const s = scaledStrength(a, target);
  const base: Record<AbilityDef['kind'], string> = {
    INJUNCTION: 'A channel goes dark',
    DISTRACTION: `-${s} Story Freshness`,
    HEAT_SURGE: `+${state.defensePurchases['proxy_relay'] > 0 ? Math.ceil(s / 2) : s}% Heat`,
    COUNTER_STORY: `+${s}% Cover-Up`,
    BOT_SWARM: `${s} Spin Bubbles: shatter them!`,
    DOUBT_WAVE: `+${s}% Doubt everywhere`,
    EVIDENCE_RAID: `-${s}% Investigation`,
    ACCOUNT_FREEZE: `-${s} ⚡ seized`,
    ROADBLOCK: `Border spread halved for ${s} days`,
    LANE_JAM: `${a.branch ?? 'Social'} channels at 60% for ${s} days`,
    REGION_LOCK: `${ZONE_NAMES[a.zone ?? 'SW']} at half speed for ${s} days`
  };
  return [base[a.kind], ...notes].join(' • ');
};

export const buildAbilityAlert = (target: TargetArchetype, a: AbilityDef, state: Pick<GameState, 'defensePurchases'>, notes: string[]): GameAlert => ({
  id: uid('ability'),
  archetype: 'TARGET_PR',
  stampText: a.stamp,
  headline: a.headline,
  body: `"${fillTarget(a.line, target)}"`,
  subtext: abilitySubtext(a, target, state, notes),
  buttonText: 'Fight Back',
  priority: 79
});

// ---------------------------------------------------------------------------
// Player-initiated alerts
// ---------------------------------------------------------------------------
export const AlertFactory = {
  // Seed pop (Day 1): STREET_WHISPER
  createSeedAlert: (stateName: string, target: TargetArchetype, climateId?: string, copySeed = 0): GameAlert => {
    const c = pickCopy('SEED', copySeed, { State: stateName, Target: target.shortName })!;
    return {
      id: uid('seed'),
      archetype: 'STREET_WHISPER',
      stampText: 'GROUND ZERO // FIRST WHISPER',
      headline: c.headline,
      body: c.body,
      subtext: `Contagion Active • Clock Started${climateId && climateId !== 'CLEAR_SKIES' ? ` • ${getClimate(climateId).icon} ${getClimate(climateId).name}` : ''}`,
      buttonText: c.button ?? 'Fan the Flames',
      priority: 100
    };
  },

  // Channel acquired: Street/Social => VIRAL_RECEIPT, Press/Elite => BREAKING_FRONT
  createChannelAlert: (channelId: string, category: ScandalCategory, target: TargetArchetype, copySeed = 0): GameAlert | null => {
    const channel = getChannel(channelId);
    if (!channel) return null;
    const isPressOrElite = channel.branch === 'PRESS' || channel.branch === 'ELITE';
    const matched = channel.synergy.includes(category);
    return {
      id: uid(`chan_${channel.id}`),
      archetype: isPressOrElite ? 'BREAKING_FRONT' : 'VIRAL_RECEIPT',
      stampText: isPressOrElite ? `${channel.branch} SYNDICATION` : 'VIRAL GIST ALERT',
      headline: channel.name,
      body: `"${channelFlavorLine(channel, category, target, String(Date.now() % 7))}"`,
      subtext: `Velocity +${channel.velocity} • Credibility +${channel.credibility} • Notoriety +${channel.notoriety}${matched ? ' • SYNERGY x1.35' : ''}`,
      buttonText: pickFrom(['Keep Pushing', 'Turn It Up', 'Let It Roll', 'Spread It', 'More Fuel'], 'chan:' + channelId, copySeed),
      priority: 100
    };
  },

  // Evidence leaked: genuine => BREAKING_FRONT, forgery success => VIRAL_RECEIPT, exposed => TARGET_PR
  createEvidenceAlert: (item: EvidenceItem, backfired: boolean, category: ScandalCategory, target: TargetArchetype, copySeed = 0): GameAlert => {
    const variant = getEvidenceVariant(item, category, target.parody, target.storyOnly);
    if (backfired) {
      return {
        id: uid(`ev_backfire_${item.id}`),
        archetype: 'TARGET_PR',
        stampText: 'FORENSIC DEBUNK // BACKFIRE!',
        headline: `Fake "${variant.name}" Exposed!`,
        body: `"Independent metadata analysts and ${target.shortName}'s legal team just proved your leaked file was doctored. The streets are calling your operation a paid smear job!"`,
        subtext: '+20% National Doubt • +25% Heat • +15% Cover-Up',
        buttonText: pickFrom(['Damage Control', 'Take the Hit', 'Regroup', 'Eat the Loss'], 'bf:' + item.id, copySeed),
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
      subtext: `-${item.doubtReduction}% Doubt • +${item.heatIncrease}% Heat • -${item.coverUpReduction}% Cover-Up • +${item.freshnessBoost} Freshness`,
      buttonText: pickFrom(['Watch Them Sweat', 'Let It Land', 'Light the Fuse', 'Hit Send'], 'ev:' + item.id, copySeed),
      priority: 100
    };
  },

  // Defense purchased: SECURITY_WIRE
  createDefenseAlert: (item: DefenseItem, copySeed = 0): GameAlert => ({
    id: uid(`def_${item.id}`),
    archetype: 'SECURITY_WIRE',
    stampText: 'OPSEC PROTOCOL // EXECUTED',
    headline: item.name,
    body: item.alertBody,
    subtext: `-${item.heatReduction}% Heat${item.id === 'proxy_relay' ? ' • Notoriety Heat -25%' : ''}${item.id === 'san_injunction' ? ' • Spin Bubbles Neutralized • Injunctions Blocked' : ''}${item.id === 'whistleblower' ? ' • Investigation Nearly Doubled' : ''}`,
    buttonText: pickFrom(['Stay in the Shadows', 'Go Dark', 'Cover Tracks', 'Breathe Easy'], 'def:' + item.id, copySeed),
    priority: 100
  }),

  // -------------------------------------------------------------------------
  // Background tick audit. Returns at most ONE alert: the highest-priority candidate.
  // -------------------------------------------------------------------------
  evaluateTickTriggers: (
    next: GameState,
    eventCandidate?: GameAlert | null
  ): { alert: GameAlert; milestoneId: string; abilityIndex?: number; eventId?: string; signature?: boolean } | null => {
    const target = getTarget(next.activeTargetId);
    type Candidate = { alert: GameAlert; milestoneId: string; abilityIndex?: number; eventId?: string; signature?: boolean };
    const candidates: Candidate[] = [];
    const triggered = new Set(next.triggeredMilestones);
    const tryQueue = (milestoneId: string, alert: GameAlert) => {
      if (!triggered.has(milestoneId)) candidates.push({ milestoneId, alert });
    };

    const states = next.states;
    const believerPct = nationalBelieverPct(states);
    const avgDoubt = nationalAverageDoubt(states);
    const budget = next.dayBudget;
    const halfDay = Math.round(budget / 2);
    const finalDay = budget - 3;

    // --- A. CLOCK ---
    if (next.currentDay >= halfDay && next.currentDay < finalDay) {
      tryQueue('CLOCK_HALFWAY', {
        id: 'clock_half', archetype: 'BREAKING_FRONT', stampText: `EDITORIAL DESK // DAY ${halfDay}`,
        headline: 'Attention Span Warning',
        body: '"Half the timeline has elapsed. In Nigeria, a scandal only lasts two weeks before the next distraction drops. Escalate now or the story dies."',
        subtext: `${budget - halfDay} Days Remaining`, buttonText: 'Step on the Gas', priority: 50
      });
    }
    if (next.currentDay >= finalDay && next.currentDay <= budget) {
      tryQueue('CLOCK_FINAL', {
        id: 'clock_final', archetype: 'BREAKING_FRONT', stampText: '72 HOURS LEFT',
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

    // Counter-offensives fire on Believers OR on the Cover-Up meter, whichever gets there first.
    const stoic = target.ai.temperament === 'THE_STOIC';
    const offensive = (id: string, believerAt: number, coverAt: number, stamp: string, headline: string, body: string, button: string, priority: number) => {
      if (believerPct < believerAt && next.coverUp < coverAt) return;
      if (stoic && id !== 'TARGET_PR_70') return; // The Stoic saves everything for the ambush
      const effects = milestoneEffect(id, next);
      tryQueue(id, {
        id: id.toLowerCase(), archetype: 'TARGET_PR', stampText: stamp, headline, body,
        subtext: effects ? `Target Counter-Move: ${effectSubtext(effects)}` : undefined, buttonText: button, priority
      });
    };
    offensive('TARGET_PR_20', 20, 30, 'OFFICIAL PRESS RELEASE // FAKE NEWS DENIAL', '"Ignore the Jobless Detractors!"',
      `"${target.shortName}'s office has issued a 4-page press statement claiming all allegations are AI-generated deepfakes sponsored by enemies of progress."`,
      'Counter With Receipts', 72);
    offensive('TARGET_PR_45', 45, 55, 'CRISIS PR // WAR CHEST DEPLOYED', 'Paid Influencers Flood Timeline',
      `"${target.shortName} just wired millions to top PR firms and defensive influencers to trend #StandWithOurLeader and muddy the waters."`,
      'Expose Them', 74);
    offensive('TARGET_PR_70', 70, 80, 'DESPERATION MOVE // SYMPATHY PLAY', 'Target Spotted in Neck Brace!',
      `"Cornered by the scandal, ${target.shortName} was just photographed being wheeled into a private clinic in London with a sudden 'mystery ailment' while threatening a ₦10 Billion lawsuit."`,
      'No Mercy', 76);

    // AI temperament: the Crashout melts down early; the Stoic ambushes late.
    if (target.ai.temperament === 'THE_CRASHOUT' && (believerPct >= BALANCE.crashoutBelieverPct || next.coverUp >= 25)) {
      const effects = milestoneEffect('CRASHOUT', next) ?? [];
      tryQueue('CRASHOUT', {
        id: 'crashout', archetype: 'TARGET_PR', stampText: 'PUBLIC MELTDOWN // CAUGHT ON CAMERA',
        headline: `${target.shortName} Loses It on Camera`,
        body: `"${target.ai.chatter.onCritical}" ${target.shortName} was filmed shouting at reporters. The clip is everywhere.`,
        subtext: effectSubtext(effects), buttonText: 'Ride the Momentum', priority: 73
      });
    }
    if (stoic && (believerPct >= BALANCE.stoicAmbushPct || next.coverUp >= 60)) {
      const effects = milestoneEffect('STOIC_AMBUSH', next) ?? [];
      tryQueue('STOIC_AMBUSH', {
        id: 'stoic_ambush', archetype: 'TARGET_PR', stampText: 'THE AMBUSH // YEARS IN THE MAKING',
        headline: `${target.shortName} Finally Strikes`,
        body: `"${target.ai.chatter.onCritical}" After weeks of silence, ${target.shortName}'s team released everything at once: lawyers, statements, bots and a very loud press conference.`,
        subtext: `Target Counter-Move: ${effectSubtext(effects)}`, buttonText: 'Brace for Impact', priority: 80
      });
    }

    // THE_SCHEMER plants a bait: a perfect-looking bombshell that is actually a plant.
    if (target.ai.temperament === 'THE_SCHEMER' && !triggered.has('SCHEMER_BAIT') && (believerPct >= 30 || next.coverUp >= 40)) {
      const bait = buildEventAlert(SCHEMER_EVENT, next);
      candidates.push({ alert: { ...bait, priority: 74 }, milestoneId: 'SCHEMER_BAIT', eventId: bait.eventId });
    }

    // Signature move: the Target's strongest ability, once, at double strength, at 50% Believers.
    if (!triggered.has('SIGNATURE') && target.abilities.length > 0 && believerPct >= BALANCE.signaturePct) {
      const idx = target.abilities.length - 1;
      const a = target.abilities[idx];
      candidates.push({
        alert: buildAbilityAlert(target, { ...a, strength: a.strength * BALANCE.signatureStrength, stamp: `SIGNATURE MOVE // ${a.stamp}` }, next, []),
        milestoneId: 'SIGNATURE', abilityIndex: idx, signature: true
      });
    }

    if (next.coverUp >= 65) {
      tryQueue('COVER_65', {
        id: 'cover_65', archetype: 'TARGET_PR', stampText: 'COVER-UP AT 65%',
        headline: 'The Story Is Being Buried',
        body: `"${target.shortName}'s machine is working overtime: lawyers, publicists and friendly editors. If the cover-up reaches 100%, the story is dead."`,
        subtext: 'Leak evidence and shatter Spin bubbles to push it back', buttonText: 'Fight the Cover-Up', priority: 76
      });
    }
    if (next.coverUp >= 88) {
      tryQueue('COVER_88', {
        id: 'cover_88', archetype: 'TARGET_PR', stampText: 'NEUTRALIZATION IMMINENT',
        headline: 'One Press Conference From Victory',
        body: `"${target.shortName} is about to announce that the matter is 'closed'. After that, no editor will touch the story. Hit them with evidence NOW."`,
        subtext: 'Cover-Up at 88%', buttonText: 'Last Chance', priority: 92
      });
    }

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

    // --- F. TARGET ABILITIES (due on or after their scheduled day) ---
    target.abilities.forEach((a, i) => {
      if (next.abilityNext[i] !== undefined && next.abilityNext[i] <= next.currentDay) {
        candidates.push({
          alert: buildAbilityAlert(target, a, next, []),
          milestoneId: `ABILITY_${i}_${next.abilityNext[i]}`,
          abilityIndex: i
        });
      }
    });

    // --- G. EVENTS / INFORMANT TIPS ---
    if (eventCandidate) {
      candidates.push({ alert: eventCandidate, milestoneId: `EVENT_${eventCandidate.eventId}`, eventId: eventCandidate.eventId });
    }

    if (candidates.length === 0) return null;

    // Variants: the run's copySeed picks which wording each milestone uses.
    const hubText = (id: string) => hubNames[id] ?? { name: id, desc: 'the local networks' };
    const varied = candidates.map(c => {
      const id = c.milestoneId;
      const key = id.startsWith('HUB_') ? 'HUB' : id.startsWith('SWEEP_') ? 'SWEEP' : id === 'FIRST_STATE_FLIP' ? 'FLIP' : COPY[id] ? id : null;
      if (!key) return c;
      const vars: Record<string, string> = { Target: target.shortName, Chatter: target.ai.chatter.onCritical };
      if (key === 'HUB') { const h = hubText(id.slice(4)); vars.Hub = h.name; vars.HubDesc = h.desc; }
      if (key === 'SWEEP') vars.Zone = ZONE_NAMES[id.slice(6) as keyof typeof ZONE_NAMES] ?? '';
      if (key === 'FLIP') vars.State = flipped?.name ?? 'The state';
      const picked = pickCopy(key, next.copySeed, vars);
      if (!picked) return c;
      return { ...c, alert: { ...c.alert, headline: picked.headline, body: picked.body, buttonText: picked.button ?? c.alert.buttonText } };
    });
    varied.sort((a, b) => b.alert.priority - a.alert.priority);
    return varied[0];
  }
};
