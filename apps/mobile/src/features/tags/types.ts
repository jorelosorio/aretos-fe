/**
 * Tags are the user's own labels, shared by goals and diary notes
 * (`internal/api/v1/tag_service.go`).
 *
 * There is no CRUD for them: saving a name on a goal or a note creates the
 * tag, and every later save reuses it. Names match ignoring case, and the
 * spelling kept is the one the tag was first saved with — so what a write
 * sends and what it reads back can differ in case, and the response wins.
 */

export type WireTag = { id: string; name: string; uses: number };

export type WireTags = { tags: WireTag[] };

export type Tag = {
  id: string;
  name: string;
  /**
   * How many goals and notes carry it, together. A tag nothing carries any
   * more still comes back, at 0 and last — it is still the user's word.
   */
  uses: number;
};
