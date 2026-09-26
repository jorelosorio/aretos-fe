import { useCallback, useLayoutEffect, useMemo } from 'react';
import { RefreshControl, ScrollView } from 'react-native';
import { FlashList } from '@shopify/flash-list';
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
import { capitalize } from '@/utils/text';

import { monthLabel } from './diary-date';
import { DiaryEntryCard } from './diary-entry-card';
import { toRows, type DiaryRow } from './diary-rows';
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

  const read = useCallback(
    (note: DiaryNote) =>
      router.push({ pathname: '/diary/[id]', params: { id: note.id } }),
    [router],
  );

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

  const refresh = (
    <RefreshControl
      refreshing={isRefetching}
      onRefresh={() => void refetch()}
      tintColor={theme.primary.val}
      colors={[theme.primary.val]}
    />
  );

  const header = (
    <>
      <TagFilter value={tag} onChange={selectTag} />
      {error ? (
        <YStack px={SPACING.screen} pt={SPACING.group} pb={SPACING.items}>
          <ErrorNotice message={toMessage(error)} />
        </YStack>
      ) : null}
    </>
  );

  if (rows.length === 0) {
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.background.val }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: tabBarInset }}
        refreshControl={refresh}
      >
        {header}
        {isPending ? (
          <ScreenLoader />
        ) : error ? null : tag !== null ? (
          <EmptyLog
            Icon={Tag}
            title={t('diary.filtered.title', { tag: capitalize(tag) })}
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
        )}
      </ScrollView>
    );
  }

  return (
    <YStack flex={1} bg="$background">
      <FlashList
        data={rows}
        keyExtractor={(row) => row.key}
        getItemType={(row: DiaryRow) => row.kind}
        contentContainerStyle={{ paddingBottom: tabBarInset }}
        refreshControl={refresh}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
        }}
        ListHeaderComponent={header}
        renderItem={({ item }) =>
          item.kind === 'month' ? (
            <YStack px={SPACING.screen} pt={SPACING.section} pb={SPACING.items}>
              <SectionTitle>{monthLabel(item.month, locale)}</SectionTitle>
            </YStack>
          ) : (
            <YStack px={SPACING.screen} pb={SPACING.items}>
              <DiaryEntryCard note={item.note} onOpen={read} />
            </YStack>
          )
        }
        ListFooterComponent={
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
        }
      />
    </YStack>
  );
}
