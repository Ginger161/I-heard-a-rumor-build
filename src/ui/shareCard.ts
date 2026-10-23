import type { GameState } from '../engine/types';
import { getTarget } from '../engine/data/targets';
import { getClimate } from '../engine/data/climates';
import { nationalBelieverPct } from '../engine/selectors';
import { shareText } from '../engine/share';
import { PARODY_WIN } from '../engine/data/parody';
import { isPremium } from '../engine/premium';

// The result as a picture: a tabloid front page, sized 4:5 for WhatsApp Status and Instagram. It is drawn on a canvas, so
// it works offline and needs no image files.
const W = 1080, H = 1350;
const INK = '#1A1A1A', PAPER = '#EFEBE0', RED = '#8B0000', GOLD = '#B45309';
const SERIF = 'Georgia, "Times New Roman", serif';
const MONO = '"Courier New", ui-monospace, monospace';

const wrap = (ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] => {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = '';
  words.forEach(w => {
    const next = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(next).width > maxW && cur) { lines.push(cur); cur = w; } else cur = next;
  });
  if (cur) lines.push(cur);
  return lines;
};

export interface CardInfo { stars: number; score: number; name: string; url: string }

const headlineFor = (s: GameState, shortName: string): string => {
  switch (s.status) {
    case 'WON': return getTarget(s.activeTargetId).parody ? `${shortName.toUpperCase()} CANCELLED!` : `${shortName.toUpperCase()} DISGRACED!`;
    case 'LOST_HEAT': return 'SAFEHOUSE RAIDED!';
    case 'LOST_COVERUP': return `${shortName.toUpperCase()} WALKS FREE!`;
    default: return 'RUMOUR FIZZLES OUT!';
  }
};

export const renderShareCard = async (s: GameState, info: CardInfo): Promise<Blob | null> => {
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d');
  if (!ctx) return null;
  const target = getTarget(s.activeTargetId);
  const won = s.status === 'WON';
  const day = Math.min(s.currentDay, s.dayBudget);
  const believers = Math.round(nationalBelieverPct(s.states));

  // paper
  ctx.fillStyle = won ? PAPER : '#F1E4E4';
  ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 2600; i++) { ctx.fillStyle = `rgba(0,0,0,${Math.random() * 0.035})`; ctx.fillRect(Math.random() * W, Math.random() * H, 2, 2); }
  const gold = isPremium();
  ctx.strokeStyle = gold ? '#B8860B' : INK; ctx.lineWidth = gold ? 16 : 10; ctx.strokeRect(28, 28, W - 56, H - 56);
  ctx.lineWidth = 3; ctx.strokeRect(46, 46, W - 92, H - 92);

  // masthead
  ctx.fillStyle = INK; ctx.textAlign = 'center';
  ctx.font = `900 74px ${SERIF}`; ctx.fillText(gold ? 'THE DAILY GIST • GOLD' : 'THE DAILY GIST', W / 2, 150);
  ctx.fillRect(80, 172, W - 160, 5); ctx.fillRect(80, 184, W - 160, 2);
  ctx.font = `700 26px ${MONO}`;
  ctx.fillText(`${(s.dailyKey ? `DAILY CASE ${s.dailyKey}` : s.challenge ? 'CHALLENGE CASE' : s.storyId ? 'STORY MODE' : 'SPECIAL EDITION').toUpperCase()}  •  ${getClimate(s.climateId).name.toUpperCase()}`, W / 2, 228);

  // headline
  ctx.fillStyle = won ? INK : RED;
  let size = 124;
  const head = headlineFor(s, target.shortName);
  ctx.font = `900 ${size}px ${SERIF}`;
  while (ctx.measureText(head).width > W - 160 && size > 56) { size -= 4; ctx.font = `900 ${size}px ${SERIF}`; }
  const headLines = wrap(ctx, head, W - 160);
  headLines.forEach((l, i) => ctx.fillText(l, W / 2, 360 + i * (size + 8)));
  let y = 360 + headLines.length * (size + 8);

  // the subject
  ctx.fillStyle = INK; ctx.font = `italic 700 38px ${SERIF}`;
  wrap(ctx, `“${s.scandalTitle}”`, W - 200).forEach(l => { ctx.fillText(l, W / 2, y); y += 50; });
  y += 20;

  // stars or the stamp
  if (won) {
    ctx.font = `900 120px ${SERIF}`;
    ctx.fillStyle = GOLD;
    ctx.fillText('★'.repeat(info.stars) + '☆'.repeat(3 - info.stars), W / 2, y + 90);
    y += 150;
  } else {
    ctx.save(); ctx.translate(W / 2, y + 60); ctx.rotate(-0.07);
    ctx.strokeStyle = RED; ctx.lineWidth = 10; ctx.strokeRect(-250, -70, 500, 120);
    ctx.fillStyle = RED; ctx.font = `900 80px ${SERIF}`; ctx.fillText(s.status === 'LOST_HEAT' ? 'BUSTED' : 'SPUN', 0, 22);
    ctx.restore();
    y += 150;
  }

  // the numbers
  const stats: [string, string][] = [['DAY', `${day}/${s.dayBudget}`], ['BELIEVERS', `${believers}%`], ['PEAK HEAT', `${Math.round(s.peakHeat)}%`], ['SCORE', won ? String(info.score) : '—']];
  const colW = (W - 160) / 4;
  stats.forEach(([label, val], i) => {
    const x = 80 + colW * i + colW / 2;
    ctx.fillStyle = INK; ctx.font = `900 64px ${MONO}`; ctx.fillText(val, x, y + 50);
    ctx.fillStyle = '#555'; ctx.font = `700 22px ${MONO}`; ctx.fillText(label, x, y + 86);
  });
  y += 140;
  ctx.fillStyle = INK; ctx.fillRect(80, y, W - 160, 3);
  y += 60;

  if (s.challenge) {
    ctx.fillStyle = INK; ctx.font = `700 34px ${SERIF}`;
    const beat = won && info.score > s.challenge.score;
    ctx.fillText(won ? (beat ? `I beat ${s.challenge.by}'s ${s.challenge.score}!` : `${s.challenge.by} had ${s.challenge.score}. I got ${info.score}.`) : `Could not beat ${s.challenge.by}'s ${s.challenge.score}.`, W / 2, y);
    y += 56;
  }
  ctx.fillStyle = '#444'; ctx.font = `italic 30px ${SERIF}`;
  const flavor = won && target.parody ? PARODY_WIN.headline : won ? `${target.fullName} never saw it coming.` : `${target.fullName} lives to deny another day.`;
  wrap(ctx, flavor, W - 220).forEach(l => { ctx.fillText(l, W / 2, y); y += 42; });

  // instrument bars: where the case ended up
  y += 24;
  const bar = (label: string, value: number, color: string, mark?: number) => {
    const bx = 120, bw = W - 240, bh = 30;
    ctx.textAlign = 'left'; ctx.fillStyle = INK; ctx.font = `700 24px ${MONO}`; ctx.fillText(label, bx, y);
    ctx.textAlign = 'right'; ctx.fillText(`${Math.round(value)}%`, bx + bw, y);
    ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(bx, y + 12, bw, bh);
    ctx.fillStyle = color; ctx.fillRect(bx, y + 12, (bw * Math.min(100, value)) / 100, bh);
    if (mark !== undefined) { ctx.fillStyle = INK; ctx.fillRect(bx + (bw * mark) / 100 - 2, y + 6, 4, bh + 12); }
    ctx.strokeStyle = INK; ctx.lineWidth = 3; ctx.strokeRect(bx, y + 12, bw, bh);
    y += 82;
  };
  bar('BELIEVERS (goal 75%)', believers, '#B91C1C', 75);
  bar('PEAK HEAT', s.peakHeat, '#F59E0B');
  bar('PEAK COVER-UP', s.peakCoverUp, '#7C3AED');
  ctx.textAlign = 'center';
  if (won && y < H - 300) {
    ctx.save(); ctx.translate(W / 2, y + 40); ctx.rotate(-0.02);
    ctx.fillStyle = RED; ctx.fillRect(-300, -40, 600, 80);
    ctx.fillStyle = '#FFF'; ctx.font = `900 40px ${SERIF}`; ctx.fillText(`BEAT MY ${info.score}`, 0, 14);
    ctx.restore();
  }

  // footer
  ctx.fillStyle = INK; ctx.fillRect(0, H - 200, W, 200);
  ctx.fillStyle = '#FDE68A'; ctx.font = `900 54px ${SERIF}`; ctx.fillText('I HEARD A RUMOR', W / 2, H - 120);
  ctx.fillStyle = '#F4F1EA'; ctx.font = `700 28px ${MONO}`;
  ctx.fillText(`${info.name ? `Posted by ${info.name}  •  ` : ''}Think you can do better?`, W / 2, H - 76);
  if (gold) { ctx.fillStyle = '#FDE68A'; ctx.font = `900 26px ${MONO}`; ctx.fillText('★ SUPPORTER EDITION ★', W / 2, H - 170); }
  ctx.fillStyle = '#9CA3AF'; ctx.font = `600 24px ${MONO}`;
  ctx.fillText(info.url.replace(/^https?:\/\//, ''), W / 2, H - 38);

  return new Promise(res => c.toBlob(b => res(b), 'image/png'));
};

// Shares the picture with the text and link if the phone supports it; otherwise downloads the picture and copies the text.
export const shareResultCard = async (s: GameState, info: CardInfo & { link: string }): Promise<'shared' | 'saved' | 'failed'> => {
  const text = `${shareText(s, info.stars)}\nScore ${info.score}. Beat me: ${info.link}`;
  const blob = await renderShareCard(s, info).catch(() => null);
  try {
    if (blob) {
      const file = new File([blob], 'i-heard-a-rumor.png', { type: 'image/png' });
      const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
      if (nav.share && nav.canShare?.({ files: [file] })) { await nav.share({ files: [file], text, url: info.link }); return 'shared'; }
    }
  } catch { /* cancelled or unsupported: fall through to saving */ }
  try { await navigator.clipboard.writeText(text); } catch { /* clipboard unavailable */ }
  if (blob) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'i-heard-a-rumor.png'; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 3000);
    return 'saved';
  }
  return 'failed';
};

export const baseUrl = (): string => { try { return `${location.origin}${location.pathname}`; } catch { return ''; } };
