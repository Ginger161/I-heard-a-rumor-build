import React, { useState } from 'react';
import { SilhouetteKind, TargetArchetype } from '../../engine/data/targets';

interface SilhouetteProps {
  kind: SilhouetteKind;
  locked?: boolean;
  className?: string;
}

const PAPER = '#EFEBE0';

// A bust silhouette with a per-archetype accessory. Locked Targets are drawn flat grey with a padlock,
// so the player can see that a file exists but not who is in it.
export const Silhouette: React.FC<SilhouetteProps> = ({ kind, locked = false, className = '' }) => {
  const ink = locked ? '#8F8A7C' : '#1A1A1A';
  const wide = !locked && (kind === 'agbada' || kind === 'robe');

  const accessory = (() => {
    switch (kind) {
      case 'agbada': // fila cap
        return <path d="M27 27 Q40 6 53 27 Z" fill={ink} />;
      case 'suit': // tie
        return <path d="M40 60 L35.5 72 L40 94 L44.5 72 Z" fill={PAPER} />;
      case 'cap': // flat cap with brim
        return (<><path d="M25 28 Q40 9 55 28 Z" fill={ink} /><rect x="48" y="26" width="17" height="4.5" rx="2" fill={ink} /></>);
      case 'gele': // big head wrap
        return (<><ellipse cx="40" cy="21" rx="23" ry="12" fill={ink} /><path d="M20 22 Q40 34 60 22" fill="none" stroke={PAPER} strokeWidth="1.5" /></>);
      case 'robe': // clerical collar and cross
        return (<><path d="M33 60 L40 70 L47 60" fill="none" stroke={PAPER} strokeWidth="2" /><path d="M40 70 V90 M34 78 H46" stroke={PAPER} strokeWidth="2.5" /></>);
      case 'hoodie': // raised hood
        return <path d="M18 44 Q16 8 40 8 Q64 8 62 44 Q54 30 40 30 Q26 30 18 44 Z" fill={ink} />;
      case 'uniform': // peaked cap and epaulettes
        return (<><path d="M25 26 Q40 8 55 26 Z" fill={ink} /><rect x="22" y="25" width="36" height="4" rx="1.5" fill={ink} /><rect x="10" y="66" width="14" height="5" fill={PAPER} /><rect x="56" y="66" width="14" height="5" fill={PAPER} /></>);
      case 'crown': // three-point crown
        return <path d="M26 24 L30 8 L36 18 L40 4 L44 18 L50 8 L54 24 Z" fill={ink} />;
      case 'mic': // handheld microphone
        return (<><circle cx="62" cy="52" r="5" fill={ink} /><rect x="59.5" y="56" width="5" height="16" rx="2" fill={ink} /></>);
      case 'glasses': // round glasses
        return (<><circle cx="34" cy="34" r="5" fill="none" stroke={PAPER} strokeWidth="1.8" /><circle cx="46" cy="34" r="5" fill="none" stroke={PAPER} strokeWidth="1.8" /><path d="M39 34 H41" stroke={PAPER} strokeWidth="1.8" /></>);
    }
  })();

  return (
    <svg viewBox="0 0 80 100" className={className} aria-hidden="true">
      <path
        d={wide ? 'M0 100 C0 68 20 55 40 55 C60 55 80 68 80 100 Z' : 'M10 100 C10 70 24 58 40 58 C56 58 70 70 70 100 Z'}
        fill={ink}
      />
      <circle cx="40" cy="34" r="14" fill={ink} />
      {!locked && accessory}
      {locked && (
        <g>
          <rect x="29" y="46" width="22" height="18" rx="3" fill="#1A1A1A" />
          <path d="M33 46 V40 a7 7 0 0 1 14 0 V46" fill="none" stroke="#1A1A1A" strokeWidth="3.5" />
          <circle cx="40" cy="55" r="2.5" fill={PAPER} />
        </g>
      )}
    </svg>
  );
};

// A Target's portrait: their uploaded image when they have one (falling back to the silhouette if it fails to load),
// otherwise the silhouette. Locked Targets always show the silhouette so nothing is revealed.
export const Avatar: React.FC<{ target: TargetArchetype; locked?: boolean; className?: string }> = ({ target, locked = false, className = '' }) => {
  const [failed, setFailed] = useState(false);
  const url = target.avatar?.imageUrl;
  if (url && !locked && !failed) {
    return <img src={url} alt="" loading="lazy" referrerPolicy="no-referrer" onError={() => setFailed(true)} className={`object-cover ${className}`} />;
  }
  return <Silhouette kind={target.silhouette} locked={locked} className={className} />;
};
