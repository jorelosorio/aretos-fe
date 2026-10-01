import { useEffect, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';
import { onlineManager, useQueryClient } from '@tanstack/react-query';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';

import { useSession } from '@/features/auth/hooks';
import { diaryNotesSync } from '@/features/diary/sync';
import { openUserDatabase } from '@/lib/db/client';
import { LocalDatabaseContext, type LocalDatabase } from '@/lib/db/context';
import migrations from '@/lib/db/migrations/migrations';
import { createSyncer, type SyncAdapter } from '@/lib/sync/engine';

const SYNCED: readonly SyncAdapter[] = [diaryNotesSync];

function DatabaseSession({
  userId,
  onChange,
}: {
  userId: string;
  onChange: (value: LocalDatabase) => void;
}) {
  const queryClient = useQueryClient();
  const [handle] = useState(() => openUserDatabase(userId));
  const { success, error } = useMigrations(handle.db, migrations);
  const [syncer] = useState(() =>
    createSyncer(handle.db, SYNCED, {
      onChanged: (tables) => {
        for (const queryKey of new Set(
          tables.flatMap((table) => table.readKeys),
        )) {
          void queryClient.invalidateQueries({ queryKey });
        }
      },
      canReach: () => onlineManager.isOnline(),
    }),
  );

  useEffect(() => {
    if (error !== undefined) {
      onChange({ status: 'failed', error });
      return;
    }
    if (!success) {
      onChange({ status: 'opening' });
      return;
    }

    onChange({ status: 'ready', db: handle.db, requestSync: syncer.sync });
    void syncer.sync();

    const stopOnline = onlineManager.subscribe((online) => {
      if (online) void syncer.sync();
    });
    const appState = AppState.addEventListener('change', (state) => {
      if (state === 'active') void syncer.sync();
    });
    return () => {
      stopOnline();
      appState.remove();
    };
  }, [success, error, handle, syncer, onChange]);

  useEffect(
    () => () => {
      syncer.stop();
      onChange({ status: 'closed' });
    },
    [syncer, onChange],
  );

  return null;
}

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const { session } = useSession();
  const [value, setValue] = useState<LocalDatabase>({ status: 'closed' });
  const userId = session?.userId ?? '';

  return (
    <LocalDatabaseContext value={value}>
      {userId !== '' && (
        <DatabaseSession key={userId} userId={userId} onChange={setValue} />
      )}
      {children}
    </LocalDatabaseContext>
  );
}
