import { NO_REASON_SOURCE, type NoReason } from './contracts';

const NO_REASON_LINES = [
  'That sounds like a beautiful problem for next month me.',
  'I already promised my future self a quieter evening.',
  'I am currently at full emotional occupancy.',
  'I cannot fit that in without turning into a cautionary tale.',
  'My bandwidth is giving me a very firm no.',
  'If I say yes to that, my calendar files a complaint.',
  'I am protecting a very fragile pocket of peace right now.',
  'That would push me from helpful into haunted.',
  'I need to decline before this becomes performance art.',
  'That plan conflicts with my commitment to staying sane.',
  'I do not have a graceful yes available today.',
  'I am already overbooked in ways my face cannot hide.',
  'That deserves better energy than I can give it.',
  'I am keeping tonight reserved for recovery and snacks.',
  'I need to leave that beautifully untouched.',
  'That is outside the range of favors I can survive this week.',
  'I am trying something radical called limits.',
  'That would turn my week from ambitious to suspicious.',
  'I would love to, in a parallel universe with fewer notifications.',
  'I cannot take that on without lying to both of us.',
  'My brain has posted a no vacancy sign.',
  'I am at the stage of the week where even my to-do list needs boundaries.',
  'That sounds fun, but I am currently booked by reality.',
  'I need a no that protects tomorrow too.',
  'I am not available for bonus chaos at this time.',
  'That asks for more sparkle than I currently possess.',
  'I am keeping my yeses on a strict budget.',
  'That would be generous in theory and regrettable in practice.',
  'I need to decline before my schedule starts smoking.',
  'I have reached my daily maximum for being remarkably accommodating.',
  'That is a no, with respect and excellent posture.',
  'I am preserving my last usable ounce of energy.',
  'I do not have room for that without evicting something important.',
  'That would require a version of me who slept better.',
  'I am choosing a boring, healthy no over an exciting mistake.',
  'That is beyond what I can realistically carry right now.',
  'I cannot responsibly volunteer my remaining brain cells.',
  'I need to keep this week lighter than my impulses suggest.',
  'That would be a great yes for someone far less tired.',
  'I am trying to stop treating availability like a personality trait.',
  'The honest answer is no, before I get creative and make it weird.',
  'I am declining now to avoid apologizing later.',
  'That would turn into resentment with better branding.',
  'I need to pass and keep my nervous system on speaking terms with me.',
  'That lands in the category of things I should admire from a distance.',
  'I am not the right yes for that one.',
  'That would overdraw my patience account immediately.',
  'I have a prior engagement with doing less.',
  'I am keeping my evening reserved for not being perceived.',
  'That is a no, but I hope it thrives elsewhere.',
];

function toNoReason(index: number): NoReason {
  const text = NO_REASON_LINES[index] ?? NO_REASON_LINES[0];

  return {
    id: `catalog-${index + 1}`,
    text,
    copiedText: text,
    source: NO_REASON_SOURCE,
  };
}

export const DEFAULT_NO_REASON = toNoReason(0);

export function getRandomNoReason(): NoReason {
  const index = Math.floor(Math.random() * NO_REASON_LINES.length);
  return toNoReason(index);
}
