import {
  EMPTY_DRAFT as EMPTY_GOAL,
  type GoalDraft,
  type StreakRule,
  type TrackingFrequency,
} from '@/features/goals/types';
import type { HabitDraft, TrackingMode } from '@/features/habits/types';

/**
 * A template is a goal as something to start from: a goal's settings, its
 * habits in order and its tags. Starting a goal from one copies it, so
 * nothing the author does afterwards reaches a goal already being tracked.
 *
 * The wire types mirror `internal/api/v1/template_service.go` field for
 * field, snake_case included. The rules — who sees what, review, the
 * official publisher — are in `aretos-be/docs/templates.md`.
 */

/**
 * What a template is written in. The list is the server's
 * `templates_language_check`, and it happens to be the app's own locales:
 * a reader is offered templates in the language they read the app in.
 */
export type TemplateLanguage = 'en' | 'es';

export const TEMPLATE_LANGUAGES = [
  'es',
  'en',
] as const satisfies readonly TemplateLanguage[];

/**
 * Whose templates a search covers. `community` is other people's, the
 * official catalog excluded; `mine` includes the caller's private and
 * unreviewed ones, which nobody else can see.
 */
export type TemplateScope = 'all' | 'official' | 'community' | 'mine';

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export type WireTemplateHabit = {
  position: number;
  name: string;
  tracking_mode: TrackingMode;
  weight: number;
  success_threshold: number | null;
  if_then_plan: string;
};

export type WireTemplate = {
  id: string;
  name: string;
  description: string;
  language: TemplateLanguage;
  tracking_frequency: TrackingFrequency;
  streak_rule: StreakRule;
  streak_threshold: number;
  streak_skip_limit: number;
  active: boolean;
  tags: string[];
  habits: WireTemplateHabit[];
  publisher: { name: string; official: boolean };
  owned: boolean;
  /** Sent to the author only. */
  review?: {
    status: ReviewStatus;
    note: string;
    reviewed_at: string | null;
    shared: boolean;
  };
  uses: number;
  created_at: string;
  updated_at: string;
};

export type WireTemplates = {
  templates: WireTemplate[];
  /** `null` on the last page. */
  next_offset: number | null;
};

/**
 * A template's habit: the settings a habit is created with, in the order the
 * goal will list them. It has no id — a template is edited as one document,
 * and its habits are replaced whole on every edit.
 */
export type TemplateHabit = HabitDraft;

export type TemplateReview = {
  status: ReviewStatus;
  /** The reviewer's reason when rejected; `''` otherwise. */
  note: string;
  reviewedAt: string | null;
  /** Anyone else can see it right now: active and approved. */
  shared: boolean;
};

export type Template = {
  id: string;
  name: string;
  description: string;
  language: TemplateLanguage;
  trackingFrequency: TrackingFrequency;
  streakRule: StreakRule;
  streakThreshold: number;
  streakSkipLimit: number;
  /** The author's switch: whether they want it shared. */
  active: boolean;
  tags: string[];
  habits: TemplateHabit[];
  publisher: {
    name: string;
    /**
     * Aretos' own account. The mark to trust — a community author can call
     * themselves anything, so the name alone proves nothing.
     */
    official: boolean;
  };
  /** The caller wrote it, which is what may edit, share or delete it. */
  owned: boolean;
  /** Where it stands with Aretos; `null` for anyone but the author. */
  review: TemplateReview | null;
  /** How many goals have been started from it. */
  uses: number;
  createdAt: string;
  updatedAt: string;
};

/** One page of a search, and where the next one starts. */
export type TemplatePage = {
  templates: Template[];
  nextOffset: number | null;
};

/**
 * What a search asks for. Every member is optional and an absent one is no
 * filter: no `language` is every language, no `scope` is `all`.
 */
export type TemplateSearch = {
  q?: string;
  tag?: string;
  scope?: TemplateScope;
  language?: TemplateLanguage;
};

/**
 * Everything the template form decides: a goal's settings, minus the colour
 * — a goal started from a template takes one of the user's free colours —
 * plus what only a template has.
 */
export type TemplateDraft = Omit<GoalDraft, 'colorSlot'> & {
  language: TemplateLanguage;
  habits: TemplateHabit[];
};

/**
 * What a new template starts as: a new goal's defaults, no habits, in the
 * language given — the reader's own, which is the one they are likeliest to
 * write in.
 */
export function emptyTemplateDraft(language: TemplateLanguage): TemplateDraft {
  return {
    name: EMPTY_GOAL.name,
    description: EMPTY_GOAL.description,
    trackingFrequency: EMPTY_GOAL.trackingFrequency,
    streakRule: EMPTY_GOAL.streakRule,
    streakThreshold: EMPTY_GOAL.streakThreshold,
    streakSkipLimit: EMPTY_GOAL.streakSkipLimit,
    tags: EMPTY_GOAL.tags,
    language,
    habits: [],
  };
}

/**
 * A patch sends only what changed. Sending `habits` or `tags` replaces the
 * whole list, and any key but `active` sends the template back to review.
 */
export type TemplatePatch = Partial<TemplateDraft> & { active?: boolean };

/** What turning a goal into a template sends: `POST /v1/goals/:id/template`. */
export type GoalExport = {
  language: TemplateLanguage;
  name: string;
};

/** The server's `maxTemplateHabits`. */
export const TEMPLATE_HABITS_MAX = 30;

/** The subset of `internal/api/errors/codes.go` this feature reacts to. */
export const TemplateErrorCode = {
  /** Writing or exporting one more template is over the plan's allowance. */
  LimitReached: 'TEMPLATE_LIMIT_REACHED',
  /** Starting a goal from one is a goal create, held to the goal limit. */
  GoalLimitReached: 'GOAL_LIMIT_REACHED',
  /** …and to the habit limit, for every habit at once. */
  HabitLimitReached: 'HABIT_LIMIT_REACHED',
  /** Also the answer for a template the caller may not see. */
  NotFound: 'NOT_FOUND',
} as const;
