// Voiceover for the gameplay trailer. Each line is its own read (ElevenLabs v3 audio tags steer delivery and are not spoken).
// `at` is the global time in seconds the line STARTS, taken from the same scene timeline the picture uses (src/timing.ts).
import { gs } from '../src/timing.ts';

export const VOICE = { name: 'Callum', id: 'N2lVS1w4EtoT3dr4eOWO' }; // hoarse, intense: picked for the first trailer
export const MODEL = 'eleven_v3';
export const FALLBACK_MODEL = 'eleven_multilingual_v2';

export const LINES = [
  { id: 'g01', at: gs('hook', 0.75), text: '[low, quiet] Somebody just heard a rumour. [pause] [colder] You started it.' },
  { id: 'g02', at: gs('target', 0.9), text: "[steady, confident] Pick your Target. Five tiers. [pause] The big men stay sealed... until you've earned them." },
  { id: 'g03', at: gs('plant', 1.9), text: '[urgent, low] Plant the rumour. [pause] Pop the first spark. [pause] [rising] And the clock starts.' },
  { id: 'g04', at: gs('channels', 1.2), text: '[building, hungry] Spend your sparks. Chain the gist, from the street... [pause] [firmer] to the front page.' },
  { id: 'g05', at: gs('spread', 1.3), text: '[hushed, in awe] Watch it spread. [pause] Street to street. State to state. [pause] Plane to plane.' },
  { id: 'g06', at: gs('spread', 8.0), text: '[low, grim] Until the whole country talks.' },
  { id: 'g07', at: gs('fight', 1.4), text: '[tense] But they fight back. Doubt. Spin. [pause] [lower] A cover-up that never sleeps.' },
  { id: 'g08', at: gs('desks', 0.8), text: '[urgent] Drop the receipts. Scrub your trail. [pause] [lower, ominous] At a hundred percent heat... they come for you.' },
  { id: 'g09', at: gs('ending', 0.4), text: '[triumphant, bold] Win the front page.' },
  { id: 'g10', at: gs('ending', 3.3), text: '[cold, flat] Or get busted.' },
  { id: 'g11', at: gs('title', 0.8), text: '[energetic, punchy] Arcade. Story. Arena. Campaigns.' },
  { id: 'g12', at: gs('title', 6.55), text: '[low, proud] I heard a rumor. [pause] [whispering] Spread am.' },
];
