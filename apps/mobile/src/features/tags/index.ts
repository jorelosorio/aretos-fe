/** Public surface of the tags feature — nothing outside it should reach deeper. */
export { tagKeys } from './api';
export { useTags } from './hooks';
export { TAGS_MAX, TAG_MAX_LENGTH, addTag, removeTag, sameTags } from './rules';
export type { Tag } from './types';
