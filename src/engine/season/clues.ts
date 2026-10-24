import type { Clue } from './types';

// THE CLUE BOARD: 24 receipts found across the season. The board shows the count and the cards; what you hold decides what you can say in the finale.
const C = (n: number, title: string, kind: Clue['kind'], chapter: number, detail: string): Clue => ({ id: `C${String(n).padStart(2, '0')}`, n, title, kind, chapter, detail });

export const CLUES: Clue[] = [
  C(1, 'A receipt you never saw', 'money', 1, 'A transfer receipt for ₦2,400,000 reached your inbox from @OracleNaija before you asked for it. The reference ends in "-HRP-0": Halo Reputation Partners, your old firm. Whoever sent it knew exactly what you needed.'),
  C(2, 'The second phone', 'chat', 2, 'One saved contact in the second phone: "HRP Ops". It has called that number every Thursday for eight months. It also supplied a perfect alibi when one was needed.'),
  C(3, 'An apology at 5:58 PM', 'doc', 2, 'A tearful statement in a Notes app, saved at 5:58 PM. Your post went live at 6:04. The apology was written before it had anything to apologise for.'),
  C(4, '"We are all on the same list"', 'chat', 3, 'Your former bestie’s last message, sent crying at 3 AM: she was paid to stop being your friend, and she is not the only one. "We are all on the same list."'),
  C(5, 'Eleven names', 'file', 3, 'A spreadsheet called "MIRROR: PERSONS OF INTEREST". Eleven names, some marked closed. Yours is the ninth. Next to it, a note: "Be kind."'),
  C(6, 'Your identity file', 'file', 4, 'Your real name, your address and your mother’s number, bought from a data broker for ₦350,000. Somebody paid to find out who you are, and Gistlord was only the middleman.'),
  C(7, 'The broker’s invoice', 'money', 4, 'The invoice for your file was paid by a cleaning company that also serves 14 Ozumba Mbadiwe: the headquarters of Halo Reputation Partners.'),
  C(8, 'Slide deck metadata', 'file', 5, 'The deck your colleague presented as his own has an author in the file properties: "R. Folorunsho". Fola. The Oracle wrote this man\'s work, not just his apology.'),
  C(9, 'Do not terminate. Instruct.', 'doc', 6, 'An HR email thread: "Do not terminate. Instruct." Your boss was told, in writing, to keep you in that job. You were kept there on purpose.'),
  C(10, 'The retainer clears Friday', 'chat', 7, 'A WhatsApp in your business partner\'s phone: "The retainer clears Friday." Paid out of your startup account, every month, to a recipient whose name is cropped.'),
  C(11, 'Biko\'s retainer', 'money', 8, 'A monthly receipt of ₦40,000 from an HRP shell, to Biko\'s account. It started in your first month together.'),
  C(12, 'A man at the generator house', 'photo', 8, 'A CCTV still from the blackout night: a man in an agbada at the generator house of HRP\'s building. He is looking at a phone. The phone is lit with your page.'),
  C(13, 'The notebook of payments', 'doc', 9, 'Your mother-in-law\'s notebook: a column of payments marked "H.R.P." Six years of them, starting the month you left Halo.'),
  C(14, 'A clause added after signing', 'doc', 10, 'A clause in your marriage papers that was typed after you both signed. The lawyer who notarised it sits on HRP\'s panel.'),
  C(15, 'The backdated deed', 'doc', 11, 'The land deed your uncle sold twice, backdated. Notarised by the same HRP lawyer.'),
  C(16, 'Project Mirror', 'doc', 11, 'A ledger page in Halo\'s handwriting: "Subject: THE RECEIPTS. Project Mirror. Year 4. Status: on track." Every person you exposed is a line on it.'),
  C(17, 'The Factory floor', 'photo', 12, 'A floor plan and a staff list: thirty writers at thirty desks. Fola\'s desk is by the window.'),
  C(18, 'Ngozi\'s drive', 'file', 12, 'An encrypted drive, kept by the one person who has watched every apology get written. One folder is named CHAPTER 16.'),
  C(19, 'Election Eve, 6:06 PM', 'doc', 13, 'Chief Mbakwe\'s campaign calendar. One entry for election eve: "6:06 PM. The Receipt." There is no name next to it. There is a page.'),
  C(20, 'The Receipt, already written', 'file', 14, 'A fabricated receipt about the opposing candidate, written in your voice, with your sign-off, scheduled to post from your page.'),
  C(21, 'The donor list', 'doc', 14, 'A signed list of the people who fund the plan. Some of the names are in the room at the wedding. One of them is a pastor.'),
  C(22, 'The Inspector\'s file', 'doc', 15, 'Inspector Coker\'s case file on The Receipts. It has your name on page one. The date on the first entry is four months old.'),
  C(23, 'The night of the incident', 'voice', 16, 'A recording of the night six years ago. Your voice, at twenty-four, dictating an apology for a client. You are crying while you write it.'),
  C(24, 'The first "Peace and light"', 'doc', 16, 'The very first one, in your handwriting. The sign-off, the format, the 6:06. Halo did not teach you the line. He stole it.')
];

export const CLUE_BY_ID: Record<string, Clue> = Object.fromEntries(CLUES.map(c => [c.id, c]));
export const CLUE_TOTAL = CLUES.length;
