import { useLocalSearchParams } from 'expo-router';

import { NoteReaderScreen } from '@/components/diary/note-reader-screen';

export default function DiaryNoteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <NoteReaderScreen id={id} />;
}
