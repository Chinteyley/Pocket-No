import { allReasons, type ReasonEntry } from './reason-catalog';

export const CATEGORY_IDS = [
  'work',
  'social',
  'tired',
  'self-care',
  'absurd',
  'savage',
  'polite',
] as const;

export type CategoryId = (typeof CATEGORY_IDS)[number];

export type Category = {
  id: CategoryId;
  label: string;
  description: string;
  pattern: RegExp;
};

export const CATEGORIES: readonly Category[] = [
  {
    id: 'work',
    label: 'Work',
    description: 'Meetings, deadlines, calendars, and bandwidth.',
    pattern:
      /\b(calendar|deadline|meeting|email|bandwidth|slack|pto|workload|project|office|boss|client|standup|sprint|backlog|capacity|roadmap|quarter|q[1-4]|ooo|overtime)\b/i,
  },
  {
    id: 'social',
    label: 'Social',
    description: 'Plans, parties, outings, and invitations.',
    pattern:
      /\b(party|parties|brunch|dinner|drinks?|birthday|wedding|hangout|plans?|gathering|invite|invitation|rsvp|group chat|small talk|event|night out|bar|club)\b/i,
  },
  {
    id: 'tired',
    label: 'Tired',
    description: 'Exhausted, overextended, running on empty.',
    pattern:
      /\b(tired|exhausted|drained|sleep|nap|rest|bed|couch|empty|depleted|knackered|spent|burnt|burnout|wiped|fried|sluggish|weary)\b/i,
  },
  {
    id: 'self-care',
    label: 'Self-care',
    description: 'Boundaries, quiet, and nervous-system protection.',
    pattern:
      /\b(peace|quiet|recovery|boundaries?|nervous system|self[- ]care|mental health|healing|recharging|sanity|limits?|calm|protect(ing)? (my|tonight|tomorrow)|balance)\b/i,
  },
  {
    id: 'absurd',
    label: 'Absurd',
    description: 'Sci-fi, surreal, and delightfully unhinged.',
    pattern:
      /\b(multiverse|parallel universe|time loop|timeline|portal|dimension|wizard|unicorn|dragon|alien|spaceship|black hole|simulation|matrix|void|existential|cosmic|ghost|haunted|prophecy)\b/i,
  },
  {
    id: 'savage',
    label: 'Savage',
    description: 'Sharp, blunt, unapologetic refusals.',
    pattern:
      /\b(absolutely not|nope|hard pass|not a chance|never|regret|resent|lying|mistake|disaster|awful|terrible|doomed|no thanks)\b/i,
  },
  {
    id: 'polite',
    label: 'Polite',
    description: 'Soft, respectful, graceful declines.',
    pattern:
      /\b(graceful|respect|appreciate|kindly|honored|flattered|lovely|beautifully|thank you|thoughtful|warmth|with love|apologi[sz]e)\b/i,
  },
] as const;

const categoryById = new Map<CategoryId, Category>();
for (const category of CATEGORIES) {
  categoryById.set(category.id, category);
}

export function getCategoryById(id: CategoryId): Category | null {
  return categoryById.get(id) ?? null;
}

export function getCategoriesFor(text: string): CategoryId[] {
  const matches: CategoryId[] = [];
  for (const category of CATEGORIES) {
    if (category.pattern.test(text)) {
      matches.push(category.id);
    }
  }
  return matches;
}

function buildCategoryIndex(): Record<CategoryId, ReasonEntry[]> {
  const index = {} as Record<CategoryId, ReasonEntry[]>;
  for (const category of CATEGORIES) {
    index[category.id] = [];
  }

  for (const entry of allReasons) {
    for (const category of CATEGORIES) {
      if (category.pattern.test(entry.text)) {
        index[category.id].push(entry);
      }
    }
  }

  return index;
}

const categoryIndex = buildCategoryIndex();

export function getReasonsByCategory(id: CategoryId): ReasonEntry[] {
  return categoryIndex[id] ?? [];
}

export function getCategoryCount(id: CategoryId): number {
  return categoryIndex[id]?.length ?? 0;
}
