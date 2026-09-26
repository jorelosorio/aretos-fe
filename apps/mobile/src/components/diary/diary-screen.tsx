import { useLayoutEffect, useMemo } from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useTheme } from '@tamagui/core';
import { NotebookPen, Plus, Tag } from '@tamagui/lucide-icons-2';
import { Spinner, XStack, YStack } from 'tamagui';

import { ErrorNotice } from '@/components/common/error-notice';
import { useTabBarInset } from '@/components/common/floating-tab-bar';
import { HeaderIconButton } from '@/components/common/header-actions';
import { ScreenLoader } from '@/components/common/screen-loader';
import { SectionTitle } from '@/components/common/section-title';
import { EmptyLog } from '@/components/logs/empty-log';
import { SPACING } from '@/constants/layout';
import {
  useDiary,
  useDiaryErrorMessage,
  type DiaryNote,
} from '@/features/diary';
import { useAllowance } from '@/features/limits';
import { useTranslations } from '@/lib/i18n';

import { monthLabel } from './diary-date';
import { DiaryEntryCard } from './diary-entry-card';
import { toRows } from './diary-rows';
import { HistoryCutoffNotice } from './history-cutoff-notice';
import { TagFilter } from './tag-filter';

export function DiaryScreen() {
  const { t, locale } = useTranslations();
  const theme = useTheme();
  const navigation = useNavigation();
  const router = useRouter();
  const params = useLocalSearchParams<{ tag?: string }>();
  const toMessage = useDiaryErrorMessage();
  const tabBarInset = useTabBarInset();
  const { canCreate } = useAllowance('diary_note');

  const tag = params.tag === undefined || params.tag === '' ? null : params.tag;

  const {
    data,
    isPending,
    error,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useDiary(tag === null ? {} : { tag });

  const rows = useMemo(() => toRows(data?.notes ?? []), [data?.notes]);

  const selectTag = (next: string | null) =>
    router.setParams({ tag: next ?? undefined });

  const read = (note: DiaryNote) =>
    router.push({ pathname: '/diary/[id]', params: { id: note.id } });

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderIconButton
          Icon={Plus}
          tone="$primary"
          label={t('diary.new')}
          disabled={!canCreate}
          onPress={() => router.push('/diary/new')}
        />
      ),
    });
  }, [navigation, router, canCreate, t]);

  return (
    <YStack flex={1} bg="$background">
      <TagFilter value={tag} onChange={selectTag} />

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
                note={item.note}
                onPress={() => read(item.note)}
              />
            </YStack>
          )
        }
        ListEmptyComponent={
          isPending ? (
            <ScreenLoader />
          ) : error ? null : tag !== null ? (
            <EmptyLog
              Icon={Tag}
              title={t('diary.filtered.title', { tag })}
              body={t('diary.filtered.body')}
              action={t('diary.filtered.action')}
              onAction={() => selectTag(null)}
            />
          ) : (
            <EmptyLog
              Icon={NotebookPen}
              title={t('diary.empty.title')}
              body={t('diary.empty.body')}
              action={canCreate ? t('diary.empty.action') : undefined}
              onAction={canCreate ? () => router.push('/diary/new') : undefined}
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
    </YStack>
  );
}
