/** Public surface of the diary feature — nothing outside it should reach deeper. */
export { DIARY_PAGE_SIZE, diaryKeys } from './api';
export {
  useAddCheckInNote,
  useCreateNote,
  useDeleteCheckInNote,
  useDeleteNote,
  useDiary,
  useDiaryErrorMessage,
  useNote,
  useNoteErrorMessage,
  useRemoveNote,
  useUpdateCheckInNote,
  useUpdateNote,
  useWriteNote,
  type Diary,
} from './hooks';
export { NOTE_BODY_MAX } from './types';
export type {
  CheckInNote,
  CheckInNoteDraft,
  CheckInNotePatch,
  DiaryCheckIn,
  DiaryFilter,
  DiaryGoal,
  DiaryNote,
  DiaryPage,
  NoteDraft,
  NotePatch,
  WireCheckInNote,
} from './types';
