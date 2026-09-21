/**
 * Third-party work the app ships, with the link each licence asks for.
 *
 * Storyset's free licence is free *with* attribution: the credit has to be
 * visible in the product, not only in a repository file, which is why this
 * lives on a settings screen rather than in a LICENSES.md nobody opens.
 *
 * The labels are deliberately not translated. They are the wording the
 * licence asks to be shown, and a translated credit is not the credit that
 * was granted.
 */
export type Credit = {
  label: string;
  url: string;
};

export const CREDITS: readonly Credit[] = [
  {
    label: 'Work illustrations by Storyset',
    url: 'https://storyset.com/work',
  },
];
