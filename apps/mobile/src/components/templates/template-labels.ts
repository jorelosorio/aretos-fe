/**
 * How a template's language and standing are named on screen.
 *
 * Shared because the search filter, the card and the forms all name a
 * language, and the card's chip and the detail's notice both name where an
 * author's template stands — two words for one state would read as two
 * different states.
 */

import type { Template, TemplateLanguage } from '@/features/templates/types';
import type { TranslationKey } from '@/lib/i18n';

/**
 * Each language in its own words, the same whatever the app is read in: a
 * reader looking for their language recognises its own name, not the one
 * another language gives it.
 */
export const LANGUAGE_NAMES: Record<TemplateLanguage, string> = {
  es: 'Español',
  en: 'English',
};

/**
 * Where an author's template stands, as one word.
 *
 * A rejection wins over everything, because it is the one state that asks
 * the author to do something. Otherwise the author's own switch comes
 * first: a private template is private whatever its review says.
 */
export type TemplateStatus = 'private' | 'review' | 'rejected' | 'shared';

export function templateStatus(template: Template): TemplateStatus | null {
  const { review } = template;
  if (review === null) return null;

  if (review.status === 'rejected') return 'rejected';
  if (!template.active) return 'private';
  if (review.shared) return 'shared';
  return 'review';
}

export const STATUS_LABELS: Record<TemplateStatus, TranslationKey> = {
  private: 'templates.status.private',
  review: 'templates.status.review',
  rejected: 'templates.status.rejected',
  shared: 'templates.status.shared',
};
