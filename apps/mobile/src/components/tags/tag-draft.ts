import { useState } from 'react';

import { addTag } from '@/features/tags';

/**
 * A form's tags, as `TagField` edits them: the chips already added, plus
 * whatever is typed in the field and not yet turned into one.
 *
 * `value` is what the form saves. It folds the typed text in, because pressing
 * Save is as clear a "yes" as pressing Return — dropping what the person just
 * wrote because they skipped a keystroke would lose it silently.
 */
export function useTagDraft(initial: readonly string[]) {
  const [tags, setTags] = useState<string[]>([...initial]);
  const [text, setText] = useState('');

  return {
    tags,
    setTags,
    text,
    setText,
    value: addTag(tags, text),
  };
}

export type TagDraft = ReturnType<typeof useTagDraft>;
