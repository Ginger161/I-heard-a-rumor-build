// Renders a contact sheet of every portrait look (and optionally every emotion) to an HTML file for review.
//   npm run avatars            -> scratch/avatars.html  (one row per Target, neutral + 7 emotions with EMOTIONS=1)
//   IDS=story_boss,godfather EMOTIONS=1 npm run avatars
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { writeFileSync, mkdirSync } from 'node:fs';
import { Face, EMOTIONS } from '../src/ui/components/Face';
import { LOOKS, lookFor } from '../src/engine/data/looks';
import { TARGETS } from '../src/engine/data/targets';
import '../src/engine/data/story';

const ids = (process.env.IDS ? process.env.IDS.split(',') : TARGETS.map(t => t.id)).filter(id => TARGETS.some(t => t.id === id));
const allEmotions = process.env.EMOTIONS === '1';

const cell = (id: string, emotion: (typeof EMOTIONS)[number]) => {
  const t = TARGETS.find(x => x.id === id)!;
  return <div key={emotion} style={{ width: 96, textAlign: 'center' }}>
    <div style={{ background: '#D9CBB0', height: 120, overflow: 'hidden' }}><Face look={lookFor(id, t.silhouette)} emotion={emotion} accent={t.avatar?.accent} className="" /></div>
    {allEmotions && <div style={{ font: '10px sans-serif' }}>{emotion}</div>}
  </div>;
};

const rows = ids.map(id => {
  const t = TARGETS.find(x => x.id === id)!;
  return <div key={id} style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 8 }}>
    <div style={{ width: 150, font: '11px sans-serif' }}><b>{id}</b><br />{(LOOKS[id]?.g ?? '?')} {(LOOKS[id]?.age ?? '?')} {(LOOKS[id]?.region ?? '?')}</div>
    {(allEmotions ? EMOTIONS : (['NEUTRAL'] as const)).map(e => cell(id, e))}
  </div>;
});

const grid = ids.map(id => { const t = TARGETS.find(x => x.id === id)!; return <div key={id} style={{ width: 104, textAlign: 'center' }}><div style={{ background: '#D9CBB0', height: 126, overflow: 'hidden' }}><Face look={lookFor(id, t.silhouette)} emotion="NEUTRAL" accent={t.avatar?.accent} className="" /></div><div style={{ font: '9px sans-serif' }}>{id}<br />{(LOOKS[id]?.g ?? '?')} {(LOOKS[id]?.age ?? '?')} {(LOOKS[id]?.region ?? '?')}</div></div>; });
const body = allEmotions ? <div>{rows}</div> : <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{grid}</div>;
const html = '<!doctype html><meta charset="utf-8"><body style="margin:12px;background:#EFEBE0">' + renderToStaticMarkup(body);
mkdirSync('scratch', { recursive: true });
writeFileSync('scratch/avatars.html', html);
console.log(`scratch/avatars.html (${ids.length} targets)`);
