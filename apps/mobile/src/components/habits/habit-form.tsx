import { useState } from 'react';
import { Stack, useRouter } from 'expo-router';

import { ErrorNotice } from '@/components/common/error-notice';
import { FormScreen } from '@/components/common/form-screen';
import {
  HeaderActions,
  HeaderTextButton,
} from '@/components/common/header-actions';
import { HabitActionsMenu } from './habit-actions-menu';
import { HabitFields } from './habit-fields';
import type { HabitDraft } from '@/features/habits/types';
import {
  useCreateHabit,
  useHabitErrorMessage,
  useUpdateHabit,
} from '@/features/habits/hooks';
import { useTranslations } from '@/lib/i18n';

export function HabitForm({
  goalId,
  habitId,
  initial,
  archived = false,
}: {
  goalId: string;
  habitId?: string;
  initial: HabitDraft;
  archived?: boolean;
}) {
  const { t } = useTranslations();
  const router = useRouter();
  const toMessage = useHabitErrorMessage();

  const {
    createHabit,
    isCreating,
    error: createError,
  } = useCreateHabit(goalId);
  const { updateHabit, isUpdating, error: updateError } = useUpdateHabit();

  const [draft, setDraft] = useState(initial);

  const patch = (change: Partial<HabitDraft>) =>
    setDraft((current) => ({ ...current, ...change }));

  const busy = isCreating || isUpdating;
  const name = draft.name.trim();

  async function save() {
    if (!name) return;

    const value: HabitDraft = { ...draft, name };

    await (
      habitId ? updateHabit({ id: habitId, patch: value }) : createHabit(value)
    )
      .then(() => router.back())
      .catch(() => undefined);
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <HeaderActions>
              <HeaderTextButton
                label={
                  habitId ? t('habits.form.update') : t('habits.form.save')
                }
                onPress={save}
                disabled={!name}
                busy={busy}
              />
              {habitId !== undefined && (
                <HabitActionsMenu habitId={habitId} archived={archived} />
              )}
            </HeaderActions>
          ),
        }}
      />

      <FormScreen>
        <ErrorNotice message={toMessage(createError ?? updateError)} />

        <HabitFields value={draft} onChange={patch} autoFocus={!habitId} />
      </FormScreen>
    </>
  );
}
