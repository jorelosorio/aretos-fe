import type { TranslateFn, TranslationKey } from '@/lib/i18n';

/**
 * The goals the guide suggests, each with the habits it suggests for it.
 *
 * Character goals on purpose: something that sounds abstract, like working
 * with excellence, made checkable by habits that are a plain yes or no. Only
 * the structure lives here; the wording is in the locale files with the rest
 * of the copy.
 *
 * Each carries a slot of the goal palette (`slot-color.ts`), shown on its
 * chip and given to the goal when it is chosen, so the three read apart at
 * a glance and the colour the user saw is the one their goal keeps.
 */
export type GuideExample = {
  name: TranslationKey;
  habits: readonly TranslationKey[];
  colorSlot: number;
};

export const GUIDE_EXAMPLES: readonly GuideExample[] = [
  {
    name: 'guide.examples.excellence.name',
    habits: [
      'guide.examples.excellence.onTime',
      'guide.examples.excellence.promises',
      'guide.examples.excellence.noGossip',
    ],
    colorSlot: 0,
  },
  {
    name: 'guide.examples.relationships.name',
    habits: [
      'guide.examples.relationships.listen',
      'guide.examples.relationships.thanks',
      'guide.examples.relationships.apologize',
    ],
    colorSlot: 3,
  },
  {
    name: 'guide.examples.calm.name',
    habits: [
      'guide.examples.calm.pause',
      'guide.examples.calm.peace',
      'guide.examples.calm.noTextFights',
    ],
    colorSlot: 1,
  },
];

/**
 * The example the goal field still holds, if any. Matching the text rather
 * than remembering which one was tapped means editing a suggested name
 * turns it into the user's own goal, and its suggested habits go with it.
 */
export function exampleFor(
  goalName: string,
  t: TranslateFn,
): GuideExample | undefined {
  const name = goalName.trim().toLocaleLowerCase();
  return GUIDE_EXAMPLES.find(
    (example) => t(example.name).toLocaleLowerCase() === name,
  );
}
