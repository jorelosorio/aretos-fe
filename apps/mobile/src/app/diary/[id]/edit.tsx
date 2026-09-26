import { useLocalSearchParams } from 'expo-router';

import { EditNoteScreen } from '@/components/diary/note-edit-screen';

export default function EditDiaryNote() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <EditNoteScreen id={id} />;
}
