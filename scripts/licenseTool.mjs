// Premium licence tool. Run it on YOUR machine only. The private key never ships with the game.
//   node scripts/licenseTool.mjs keygen                      make a key pair (once). Paste the printed public key into src/engine/premium.ts
//   node scripts/licenseTool.mjs issue --plan forever --note "Tunde (tester)"
//   node scripts/licenseTool.mjs issue --plan season --days 90 --note "Creator gift"
// A licence is a signed code. The game checks the signature with the public key, so codes work offline and cannot be
// forged without the private key. Back the private key up somewhere safe: if it is lost you cannot issue new codes.
import { webcrypto as crypto } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';

const KEY_FILE = 'private/license-private.jwk';
const b64url = buf => Buffer.from(buf).toString('base64url');
const args = process.argv.slice(2);
const cmd = args[0];
const opt = name => { const i = args.indexOf('--' + name); return i >= 0 ? args[i + 1] : undefined; };

if (cmd === 'keygen') {
  if (existsSync(KEY_FILE)) { console.error(`${KEY_FILE} already exists. Delete it only if you really want a new key (old codes will stop working).`); process.exit(1); }
  const pair = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
  mkdirSync('private', { recursive: true });
  writeFileSync(KEY_FILE, JSON.stringify(await crypto.subtle.exportKey('jwk', pair.privateKey), null, 2));
  const pub = await crypto.subtle.exportKey('jwk', pair.publicKey);
  console.log('Private key saved to', KEY_FILE, '(keep it secret, back it up).\nPublic key, paste into PUBLIC_KEY in src/engine/premium.ts:\n');
  console.log(JSON.stringify({ kty: pub.kty, crv: pub.crv, x: pub.x, y: pub.y }));
} else if (cmd === 'issue') {
  if (!existsSync(KEY_FILE)) { console.error('Run keygen first.'); process.exit(1); }
  const priv = await crypto.subtle.importKey('jwk', JSON.parse(readFileSync(KEY_FILE, 'utf8')), { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  const plan = opt('plan') ?? 'forever';
  const days = Number(opt('days') ?? 0);
  const payload = { v: 1, id: Math.random().toString(36).slice(2, 10), plan, exp: days > 0 ? Date.now() + days * 86400000 : 0, note: (opt('note') ?? '').slice(0, 40), at: Date.now() };
  const body = b64url(Buffer.from(JSON.stringify(payload)));
  const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, priv, Buffer.from(body));
  console.log(`RUMP1.${body}.${b64url(sig)}`);
} else {
  console.error('Usage: node scripts/licenseTool.mjs keygen | issue --plan forever|season [--days N] [--note "who"]');
  process.exit(1);
}
