import { useMemo, useState } from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@tamagui/core';
import { NotebookPen } from '@tamagui/lucide-icons-2';
import { Spinner, XStack, YStack } from 'tamagui';

import { ErrorNotice } from '@/components/common/error-notice';
import { useTabBarInset } from '@/components/common/floating-tab-bar';
import { ScreenLoader } from '@/components/common/screen-loader';
import { SectionTitle } from '@/components/common/section-title';
import { EmptyLog } from '@/components/logs/empty-log';
import { SPACING } from '@/constants/layout';
import {
  useDiary,
  useDiaryErrorMessage,
  type DiaryEntry,
} from '@/features/diary';
import { useTranslations } from '@/lib/i18n';

import { monthKey, monthLabel } from './diary-date';
import { DiaryEntryCard } from './diary-entry-card';
import { EntryViewer } from './entry-viewer';
import { HistoryCutoffNotice } from './history-cutoff-notice';

type Row =
  | { kind: 'month'; key: string; month: string }
  | { kind: 'entry'; key: string; entry: DiaryEntry };

function toRows(entries: readonly DiaryEntry[]): Row[] {
  const rows: Row[] = [];
  let month: string | null = null;

  for (const entry of entries) {
    const key = monthKey(entry.entryDate);

    if (key !== month) {
      month = key;
      rows.push({ kind: 'month', key: `month:${key}`, month: key });
    }
    rows.push({ kind: 'entry', key: entry.id, entry });
  }

  return rows;
}

export function DiaryScreen() {
  const { t, locale } = useTranslations();
  const theme = useTheme();
  const router = useRouter();
  const toMessage = useDiaryErrorMessage();
  const tabBarInset = useTabBarInset();

  const {
    data,
    isPending,
    error,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useDiary();

  const rows = useMemo(() => toRows(data?.entries ?? []), [data?.entries]);

  const [viewing, setViewing] = useState<DiaryEntry | null>(null);

  return (
    <>
      <FlatList
        style={{ flex: 1, backgroundColor: theme.background.val }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: tabBarInset }}
        data={rows}
        keyExtractor={(row) => row.key}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => void refetch()}
            tintColor={theme.primary.val}
            colors={[theme.primary.val]}
          />
        }
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
        }}
        ListHeaderComponent={
          error ? (
            <YStack px={SPACING.screen} pt={SPACING.screen} pb={SPACING.items}>
              <ErrorNotice message={toMessage(error)} />
            </YStack>
          ) : null
        }
        renderItem={({ item }) =>
          item.kind === 'month' ? (
            <YStack px={SPACING.screen} pt={SPACING.section} pb={SPACING.items}>
              <SectionTitle>{monthLabel(item.month, locale)}</SectionTitle>
            </YStack>
          ) : (
            <YStack px={SPACING.screen} pb={SPACING.items}>
              <DiaryEntryCard
                entry={item.entry}
                onPress={() => setViewing(item.entry)}
              />
            </YStack>
          )
        }
        ListEmptyComponent={
          isPending ? (
            <ScreenLoader />
          ) : error ? null : (
            <EmptyLog
              Icon={NotebookPen}
              title={t('diary.empty.title')}
              body={t('diary.empty.body')}
              action={t('tabs.log')}
              onAction={() => router.push('/logs/new')}
            />
          )
        }
        ListFooterComponent={
          rows.length === 0 ? null : (
            <YStack px={SPACING.screen} pb={SPACING.screen} pt={SPACING.group}>
              {isFetchingNextPage && (
                <XStack justify="center" py={SPACING.items}>
                  <Spinner color="$primary" />
                </XStack>
              )}

              {!hasNextPage &&
                !isFetchingNextPage &&
                data?.hasMoreHistory === true &&
                data.historyCutoff != null && (
                  <HistoryCutoffNotice cutoff={data.historyCutoff} />
                )}
            </YStack>
          )
        }
      />

      <EntryViewer entry={viewing} onClose={() => setViewing(null)} />
    </>
  );
}
