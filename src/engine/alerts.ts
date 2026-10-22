import { GameAlert, GameState } from './types';
import { CHANNELS_DATA } from './data/channels';
import { EVIDENCE_DATA } from './data/evidence';

export const AlertFactory = {
  // 1. SEED POP (Day 1)
  createSeedAlert: (stateName: string): GameAlert => ({
    id: `seed_${Date.now()}`,
    archetype: 'STREET_WHISPER',
    stampText: 'GROUND ZERO // FIRST WHISPER',
    headline: `Loose Lips in ${stateName}`,
    body: `"An agbero at a busy motor park in ${stateName} just overheard a wild rumor about the target. The conductor is already shouting it to the whole bus..."`,
    subtext: 'Contagion Active • Clock Started',
    buttonText: 'Fan the Flames',
    priority: 100
  }),

  // 2. CHANNEL ACQUIRED (All 23 Nodes)
  createChannelAlert: (channelId: string): GameAlert | null => {
    const channel = CHANNELS_DATA.find(c => c.id === channelId);
    if (!channel) return null;

    const isPressOrElite = channel.branch === 'PRESS' || channel.branch === 'ELITE';
    return {
      id: `chan_${channel.id}_${Date.now()}`,
      archetype: isPressOrElite ? 'BREAKING_FRONT' : 'VIRAL_RECEIPT',
      stampText: isPressOrElite ? `${channel.branch} SYNDICATION` : '🚨 VIRAL GIST ALERT',
      headline: channel.name,
      body: `"${channel.flavorTexts.DEFAULT[0]}"`,
      subtext: `Spread Multiplier +${Math.round((channel.baseMultiplier - 1) * 100)}%`,
      buttonText: 'Keep Pushing',
      priority: 100
    };
  },

  // 3. EVIDENCE LEAKED (Genuine, Fabricated Success, or Exposed Backfire)
  createEvidenceAlert: (evidenceId: string, backfired: boolean): GameAlert | null => {
    const ev = EVIDENCE_DATA.find(e => e.id === evidenceId);
    if (!ev) return null;

    if (backfired) {
      return {
        id: `ev_backfire_${ev.id}_${Date.now()}`,
        archetype: 'TARGET_PR',
        stampText: 'FORENSIC DEBUNK // BACKFIRE!',
        headline: `Fake "${ev.name}" Exposed!`,
        body: `"Independent metadata analysts and the Target's legal team just proved your leaked file was doctored. The streets are calling your operation a paid smear job!"`,
        subtext: `+20% National Doubt • +25% Heat`,
        buttonText: 'Damage Control',
        priority: 100
      };
    }

    return {
      id: `ev_${ev.id}_${Date.now()}`,
      archetype: ev.isFabricated ? 'VIRAL_RECEIPT' : 'BREAKING_FRONT',
      stampText: ev.isFabricated ? 'UNVERIFIED RECEIPT DROPPED' : 'HARD EVIDENCE LEAKED',
      headline: `${ev.name} Hits the Timeline`,
      body: ev.isFabricated 
        ? `"Nobody is checking the metadata! The doctored file is flying across WhatsApp groups and skepticism is crumbling."`
        : `"Undeniable proof. Screenshot after screenshot is circulating across the country, silencing the target's defenders."`,
      subtext: `-${ev.doubtReduction}% Doubt • +${ev.heatIncrease}% Heat`,
      buttonText: 'Watch Them Sweat',
      priority: 100
    };
  },

  // 4. DEFENSE ACTIVATED
  createDefenseAlert: (defenseName: string, heatReduced: number): GameAlert => ({
    id: `def_${Date.now()}`,
    archetype: 'SECURITY_WIRE',
    stampText: 'OPSEC PROTOCOL // EXECUTED',
    headline: defenseName,
    body: `"Routing tables scrubbed, burner SIMs snapped, and traffic bounced through offshore proxies. State cyber-trackers just lost our signal."`,
    subtext: `-${heatReduced}% Heat`,
    buttonText: 'Stay in the Shadows',
    priority: 100
  }),

  // 5. BACKGROUND TICK AUDIT (Checks Clock, Map, Target AI, Heat, Investigation)
  evaluateTickTriggers: (prevState: GameState, nextState: GameState): { alerts: GameAlert[], newMilestones: string[] } => {
    const candidates: { alert: GameAlert; milestoneId: string }[] = [];
    const triggered = new Set(nextState.triggeredMilestones || []);

    const totalPop = Object.values(nextState.states).reduce((sum, s) => sum + s.population, 0);
    const totalBelievers = Object.values(nextState.states).reduce((sum, s) => sum + s.believers, 0);
    const believerPct = (totalBelievers / totalPop) * 100;
    const avgDoubt = Object.values(nextState.states).reduce((sum, s) => sum + s.doubt, 0) / Object.keys(nextState.states).length;

    const tryQueue = (milestoneId: string, alert: GameAlert) => {
      if (!triggered.has(milestoneId)) {
        candidates.push({ milestoneId, alert });
      }
    };

    // --- A. CLOCK TRIGGERS ---
    if (nextState.currentDay === 10) {
      tryQueue('CLOCK_HALFWAY', {
        id: 'clock_10', archetype: 'BREAKING_FRONT', stampText: 'EDITORIAL DESK // DAY 10',
        headline: 'Attention Span Warning',
        body: '"Half the timeline has elapsed. In Nigeria, a scandal only lasts two weeks before the next distraction drops. Escalate now or the story dies."',
        subtext: '10 Days Remaining', buttonText: 'Step on the Gas', priority: 50
      });
    }
    if (nextState.currentDay === 17) {
      tryQueue('CLOCK_FINAL', {
        id: 'clock_17', archetype: 'BREAKING_FRONT', stampText: 'URGENT // 72 HOURS LEFT',
        headline: 'News Cycle Fading Fast',
        body: '"72 hours until the public moves on! Drop your hardest receipts and buy elite press coverage immediately."',
        subtext: '3 Days Remaining', buttonText: 'Final Push', priority: 75
      });
    }

    // --- B. INVESTIGATION MILESTONES (25%, 50%, 75%, 100%) ---
    [25, 50, 75, 100].forEach(tier => {
      if (nextState.investigationProgress >= tier) {
        tryQueue(`INV_${tier}`, {
          id: `inv_${tier}`, archetype: 'INFORMANT_TIP', stampText: `INSIDER DROP // TIER ${tier / 25}`,
          headline: 'New Classified Files Unlocked',
          body: '"Check your Evidence Locker. A source inside the secretariat just slid a fresh batch of unredacted documents under the door."',
          subtext: `Investigation at ${tier}%`, buttonText: 'Open Locker Later', priority: 60
        });
      }
    });

    // --- C. MAP & CONTAGION TRIGGERS ---
    const powerHubs = [
      { id: 'lagos', name: 'Lagos', desc: 'the commercial nerve center and media megaphones' },
      { id: 'fct', name: 'FCT (Abuja)', desc: 'the corridors of federal power and ministry lounges' },
      { id: 'kano', name: 'Kano', desc: 'the northern commercial hub and radio networks' },
      { id: 'rivers', name: 'Rivers', desc: 'the oil capital and Niger Delta street networks' }
    ];
    powerHubs.forEach(hub => {
      const s = nextState.states[hub.id];
      if (s && s.heard > 0 && nextState.startingStateId !== hub.id) {
        tryQueue(`HUB_${hub.id}`, {
          id: `hub_${hub.id}`, archetype: 'STREET_WHISPER', stampText: 'CONTAGION BREACH // MAJOR HUB',
          headline: `Rumor Hits ${hub.name}!`,
          body: `"The gist has crossed state lines into ${hub.name}, infiltrating ${hub.desc}."`,
          subtext: `${hub.name} Infected`, buttonText: 'Watch It Spread', priority: 55
        });
      }
    });

    // First State to 50% Believers
    const firstFlipped = Object.values(nextState.states).find(s => (s.believers / s.population) >= 0.5);
    if (firstFlipped) {
      tryQueue('FIRST_STATE_FLIP', {
        id: 'state_flip_50', archetype: 'BREAKING_FRONT', stampText: 'TIPPING POINT',
        headline: `${firstFlipped.name} Fully Convinced!`,
        body: `"Over half the population in ${firstFlipped.name} now believes the scandal is 100% true. Street debates have turned into open outrage."`,
        subtext: `${firstFlipped.name} > 50% Believers`, buttonText: 'Domino Effect', priority: 65
      });
    }

    // Nationwide Critical Mass (25%, 50%, 80%)
    [
      { pct: 25, title: 'National Conversation', msg: '"One in four Nigerians now believes the dossier. Mainstream TV hosts can no longer ignore the elephant in the room."' },
      { pct: 50, title: 'Half the Country Convinced!', msg: '"50% of the nation is demanding answers. Memes, sermons, and newspaper editorials are all locked on the target."' },
      { pct: 80, title: 'Regime-Shaking Outrage!', msg: '"80% national conviction! Allies are deleting old photos with the target and crisis meetings are happening behind closed doors."' }
    ].forEach(m => {
      if (believerPct >= m.pct) {
        tryQueue(`MASS_${m.pct}`, {
          id: `mass_${m.pct}`, archetype: 'BREAKING_FRONT', stampText: `CRITICAL MASS // ${m.pct}% BELIEVERS`,
          headline: m.title, body: m.msg, subtext: `${m.pct}% Nationwide Conviction`, buttonText: 'Press the Advantage', priority: 70
        });
      }
    });

    // --- D. TARGET AI COUNTER-MOVES & DOUBT ---
    if (avgDoubt >= 65) {
      tryQueue('HIGH_DOUBT_65', {
        id: 'doubt_65', archetype: 'TARGET_PR', stampText: 'SKEPTICISM SPIKE // 65% DOUBT',
        headline: 'The Streets Are Calling Cap!',
        body: '"You are pushing talk without receipts! Because no hard evidence has dropped recently, people are starting to believe this is a paid political hatchet job."',
        subtext: 'Leak Evidence Immediately to Crush Doubt', buttonText: 'Understood', priority: 78
      });
    }

    // Target PR Counter-Offensives at 20%, 45%, 70% Believers
    if (believerPct >= 20) {
      tryQueue('TARGET_PR_20', {
        id: 'tpr_20', archetype: 'TARGET_PR', stampText: 'OFFICIAL PRESS RELEASE',
        headline: '"Ignore the Jobless Detractors!"',
        body: '"The Office of the Target has issued a 4-page press statement claiming all allegations are AI-generated deepfakes sponsored by enemies of progress."',
        subtext: 'Target Counter-Move: +10% National Doubt', buttonText: 'Counter With Receipts', priority: 72
      });
    }
    if (believerPct >= 45) {
      tryQueue('TARGET_PR_45', {
        id: 'tpr_45', archetype: 'TARGET_PR', stampText: 'CRISIS PR //WAR CHEST DEPLOYED',
        headline: 'Paid Influencers Flood Timeline',
        body: '"The target just wired millions to top PR firms and defensive influencers to trend #StandWithOurLeader and muddy the waters."',
        subtext: 'Target Counter-Move: +15% National Doubt', buttonText: 'Expose Them', priority: 74
      });
    }
    if (believerPct >= 70) {
      tryQueue('TARGET_PR_70', {
        id: 'tpr_70', archetype: 'TARGET_PR', stampText: 'DESPERATION MOVE // SYMPATHY PLAY',
        headline: 'Target Spotted in Neck Brace!',
        body: '"Cornered by the scandal, the target was just photographed being wheeled into a private clinic in London with a sudden \'mystery ailment\' while threatening a ₦10 Billion lawsuit."',
        subtext: 'Target Counter-Move: +15% Heat', buttonText: 'No Mercy', priority: 76
      });
    }

    // --- E. HEAT & SECURITY TRIGGERS (40%, 70%, 90%) ---
    if (nextState.heat >= 40) {
      tryQueue('HEAT_40', {
        id: 'heat_40', archetype: 'SECURITY_WIRE', stampText: 'CYBERCRIME UNIT // WIRE',
        headline: 'IP Logs Under Review',
        body: '"A formal petition has landed on the desk of the Cybercrime Unit. Analysts have begun subpoenaing local ISP logs to trace the origin of the leaks."',
        subtext: 'Heat at 40% • Monitor Your Trail', buttonText: 'Acknowledge', priority: 82
      });
    }
    if (nextState.heat >= 70) {
      tryQueue('HEAT_70', {
        id: 'heat_70', archetype: 'SECURITY_WIRE', stampText: 'REGULATOR CLAMPDOWN // 70% HEAT',
        headline: ' FinTech & Telecom Freeze!',
        body: '"Authorities are pressuring telecoms to throttle suspicious blog traffic and freezing burner accounts connected to anonymous whistleblowers."',
        subtext: 'Heat at 70% • Deploy Defense Soon', buttonText: 'Tighten Security', priority: 85
      });
    }
    if (nextState.heat >= 90) {
      tryQueue('HEAT_90', {
        id: 'heat_90', archetype: 'SECURITY_WIRE', stampText: 'CRITICAL // DSS TRACKING VANS',
        headline: 'Signal Triangulated!',
        body: '"Unmarked Hilux vans are patrolling your subnet district! If Heat hits 100%, your safehouse door gets kicked in. Open the Defense Desk NOW!"',
        subtext: 'DANGER: 90% HEAT', buttonText: 'Emergency Protocol', priority: 95
      });
    }

    // Pick ONLY the highest priority background alert for this tick to prevent spam
    if (candidates.length === 0) return { alerts: [], newMilestones: [] };
    candidates.sort((a, b) => b.alert.priority - a.alert.priority);
    const winner = candidates[0];

    return {
      alerts: [winner.alert],
      newMilestones: [winner.milestoneId]
    };
  }
};
