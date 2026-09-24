/**
 * The two faces, and which job each one does.
 *
 * **`$heading` (Caprasimo) names things, and only three things: a screen's
 * own title, a goal's name, and a habit's name.** It is a display face with
 * one weight, and its whole value is that it is rare: what it marks is the
 * subject of what you are looking at, so anything else set in it is a false
 * subject competing with the real one.
 *
 * **`$body` (Nunito) is everything else**, including three categories that
 * look like they might qualify and do not:
 *
 * - **Section headings.** Scaffolding rather than a subject. `SectionTitle`
 *   is the body face at `TEXT.subheading` and weight 700 — a step above the
 *   content it introduces, and bold, which is what makes a heading read as
 *   one without borrowing the face reserved for names. Not uppercased
 *   either: all-caps adds emphasis without adding size, and there is no need
 *   for it once the size and weight are already doing that job.
 * - **Empty-state messages.** "No habits yet", "Nothing here" and the like
 *   are copy passed in as a prop, not the name of the thing the screen is
 *   about — there usually isn't one yet, which is the whole point of the
 *   screen. `EmptyGoals`, `EmptyHabits` and `EmptyLog` all render their
 *   `title` prop at `fontWeight="700"`, never `fontFamily="$heading"`.
 * - **Numbers and measured values.** A stat is data, not a name, and setting
 *   one in the display face puts it in direct competition with the heading
 *   beside it. These are `$body` at weight 700.
 * - **Button labels.** An action rather than a subject. The web sets its
 *   buttons in the display face, and the mobile app used to follow it through
 *   `Button`'s default props — which put Caprasimo on "Guardar registro" and
 *   "Cerrar sesión" a few points from the goal name they sat under. The
 *   default is now `$body` at weight 700, the same weight a header action
 *   such as "Guardar" is set in.
 *
 * A home screen used to stack the greeting, the section heading, a goal's
 * name and an empty-state title all in Caprasimo, within a step of each
 * other, and a reader had no way to tell which one was the point. Caprasimo
 * also used to appear at seven sizes, `$1` to `$8`, on unit labels and
 * stepper values — which is how a face meant to single something out came to
 * single out nothing.
 *
 * The sizes themselves belong to `TEXT` in `src/constants/layout.ts`, and no
 * component writes a raw one. Reach for `fontWeight` before `fontFamily`.
 */

import { createSystemFont, fonts as baseFonts } from '@tamagui/config/v5';

const body = createSystemFont({
  font: {
    family: 'Nunito-Regular',
    face: {
      400: { normal: 'Nunito-Regular' },
      500: { normal: 'Nunito-Medium' },
      600: { normal: 'Nunito-SemiBold' },
      700: { normal: 'Nunito-Bold' },
    },
  },
});

const heading = createSystemFont({
  font: { family: 'Caprasimo-Regular' },
});

export const fonts = { ...baseFonts, body, heading };
