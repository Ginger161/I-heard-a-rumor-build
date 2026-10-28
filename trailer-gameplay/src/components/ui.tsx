import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C } from '../theme';
import { FONT } from '../fonts';
import { clamp01, easeOut } from '../fx';
import { SlamText, Tag } from './kinetic';
import { useLayout } from '../layout';

/** Dark studio floor: a faint perspective grid and a warm pool of light, so floating objects have somewhere to sit. */
export const Backdrop: React.FC<{ hue?: string; grid?: boolean; z?: number }> = ({ hue = '70,110,170', grid = true, z = -420 }) => {
  const { S } = useLayout();
  const size = 5200 * S;
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: 0, height: 0, transformStyle: 'preserve-3d' }}>
      <div style={{ position: 'absolute', left: -size / 2, top: -size / 2, width: size, height: size, transform: `translateZ(${z * S}px)`, background: `radial-gradient(circle at 50% 50%, rgba(${hue},0.28) 0%, rgba(${hue},0.06) 28%, rgba(5,6,8,1) 60%)` }}>
        {grid && (
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(rgba(${hue},0.16) 2px, transparent 2px), linear-gradient(90deg, rgba(${hue},0.16) 2px, transparent 2px)`, backgroundSize: `${150 * S}px ${150 * S}px`, maskImage: 'radial-gradient(circle at 50% 50%, #000 0%, transparent 52%)', WebkitMaskImage: 'radial-gradient(circle at 50% 50%, #000 0%, transparent 52%)' }} />
        )}
      </div>
    </div>
  );
};

/**
 * Screen-space headline block: a tracked kicker, one slammed line and an optional smaller second line.
 * Anchors top-left in landscape and top-centre in portrait.
 */
export const Headline: React.FC<{ t: number; kicker: string; line: string; sub?: string; color?: string; accent?: string; side?: 'left' | 'right' }> = ({ t, kicker, line, sub, color = '#fff', accent = C.amber, side = 'left' }) => {
  const { portrait, S, w } = useLayout();
  if (t < 0) return null;
  // auto-fit: the condensed display face runs about 0.47em per character, so shrink long lines to fit the frame
  const fit = ((portrait ? w * 0.92 : w * 0.5) / (line.length * 0.47));
  const size = Math.min((portrait ? 118 : 104) * S, fit);
  const x = portrait ? 0 : side === 'left' ? 90 * S : undefined;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', top: (portrait ? 120 : 130) * S, left: portrait ? 0 : x, right: portrait ? 0 : side === 'right' ? 90 * S : undefined, textAlign: portrait ? 'center' : side === 'right' ? 'right' : 'left', width: portrait ? w : undefined }}>
        <div style={{ opacity: clamp01(t / 8), transform: `translateX(${(1 - easeOut(clamp01(t / 12))) * -40}px)` }}>
          <Tag size={26 * S} color={accent} style={{ letterSpacing: '0.42em' }}>{kicker}</Tag>
        </div>
        <div style={{ height: 20 * S }} />
        <SlamText text={line} t={t - 3} size={size} font="display" color={color} spacing={0.01} glow={`${accent}66`} />
        {sub && (
          <div style={{ marginTop: 26 * S, opacity: clamp01((t - 16) / 10), transform: `translateY(${(1 - easeOut(clamp01((t - 16) / 14))) * 18}px)`, fontFamily: FONT.sans, fontWeight: 500, fontSize: 38 * S, color: '#b9c6d6', letterSpacing: '0.02em' }}>{sub}</div>
        )}
      </div>
    </AbsoluteFill>
  );
};

/** A numbered callout chip that wipes in, holds, and (optionally) leaves. `at`/`out` in frames since scene start. */
export const Chip: React.FC<{ f: number; at: number; out?: number; n?: number; text: string; sub?: string; x: number; y: number; align?: 'left' | 'right' | 'center'; color?: string }> = ({ f, at, out = 1e9, n, text, sub, x, y, align = 'left', color = C.amber }) => {
  const { S } = useLayout();
  const t = f - at;
  if (t < 0 || f > out + 12) return null;
  const inP = easeOut(clamp01(t / 12));
  const outP = clamp01((f - out) / 10);
  const tx = align === 'right' ? -100 : align === 'center' ? -50 : 0;
  return (
    <div style={{ position: 'absolute', left: x * S, top: y * S, transform: `translate(${tx}%, ${(1 - inP) * 24 + outP * -14}px)`, opacity: inP * (1 - outP), display: 'flex', alignItems: 'center', gap: 22 * S, flexDirection: align === 'right' ? 'row-reverse' : 'row' }}>
      {n !== undefined && (
        <div style={{ width: 66 * S, height: 66 * S, borderRadius: '50%', background: color, color: '#111', fontFamily: FONT.display, fontSize: 40 * S, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 ${34 * S}px ${color}aa` }}>{n}</div>
      )}
      <div style={{ textAlign: align === 'right' ? 'right' : 'left', background: 'rgba(8,10,14,0.78)', border: `${2 * S}px solid ${color}55`, borderLeft: `${8 * S}px solid ${color}`, padding: `${16 * S}px ${26 * S}px`, backdropFilter: 'blur(6px)', borderRadius: 6 * S }}>
        <div style={{ fontFamily: FONT.display, fontSize: 50 * S, letterSpacing: '0.03em', color: '#fff', whiteSpace: 'nowrap', lineHeight: 1.05 }}>{text}</div>
        {sub && <div style={{ fontFamily: FONT.mono, fontSize: 24 * S, letterSpacing: '0.16em', color, marginTop: 8 * S, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{sub}</div>}
      </div>
    </div>
  );
};

/** A big flat lower-third stat: label + number, used on the 3D map scene. */
export const Stat: React.FC<{ label: string; value: string; color?: string; w?: number }> = ({ label, value, color = '#fff', w = 300 }) => {
  const { S } = useLayout();
  return (
    <div style={{ width: w * S, borderTop: `${4 * S}px solid ${color}`, paddingTop: 10 * S }}>
      <div style={{ fontFamily: FONT.mono, fontSize: 22 * S, letterSpacing: '0.3em', color: '#8fa6bd', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontFamily: FONT.display, fontSize: 84 * S, color, lineHeight: 1.05, textShadow: `0 0 ${30 * S}px ${color}66` }}>{value}</div>
    </div>
  );
};
