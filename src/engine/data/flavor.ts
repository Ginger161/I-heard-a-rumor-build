import { ChannelUpgrade, ScandalCategory } from './channels';
import { PARODY_CHANNEL_LINES } from './parody';
import { TargetArchetype, fillTarget } from './targets';

const hash = (s: string): number => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
};

// The line a channel "says" about the Target. Parody Targets get comic lines; everyone else gets the scandal-matched
// Nigerian flavor. `salt` varies the pick so the same channel does not always read the same way.
export const channelFlavorLine = (channel: ChannelUpgrade, category: ScandalCategory, target: TargetArchetype, salt = ''): string => {
  const pool = target.parody
    ? PARODY_CHANNEL_LINES[channel.branch]
    : (channel.flavorTexts[category]?.length ? channel.flavorTexts[category]! : channel.flavorTexts.DEFAULT);
  const line = pool[hash(channel.id + salt + target.id) % pool.length];
  return fillTarget(line, target);
};
