// Prints the hash to paste into SECRET_HASH in src/ui/egg.ts.   npm run egg:hash -- "your secret phrase"
import { createHash } from 'node:crypto';
const phrase = process.argv.slice(2).join(' ');
if (!phrase) { console.error('Usage: npm run egg:hash -- "your secret phrase"'); process.exit(1); }
const norm = phrase.toUpperCase().replace(/[^A-Z0-9]/g, '');
console.log(createHash('sha256').update('rumor-founder-v1:' + norm).digest('hex'));
