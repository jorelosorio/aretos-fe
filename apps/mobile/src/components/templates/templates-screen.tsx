import { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@tamagui/core';
import { LayoutTemplate } from '@tamagui/lucide-icons-2/icons/LayoutTemplate';
import { Plus } from '@tamagui/lucide-icons-2/icons/Plus';
import { SearchX } from '@tamagui/lucide-icons-2/icons/SearchX';
import { Spinner, XStack, YStack } from 'tamagui';

import { EmptyState } from '@/components/common/empty-state';
import { ErrorNotice } from '@/components/common/error-notice';
import { useTabBarInset } from '@/components/common/floating-tab-bar';
import { ScreenLoader } from '@/components/common/screen-loader';
import { PlanLimitNotice } from '@/components/goals/plan-limit-notice';
import { SPACING } from '@/constants/layout';
import { useAllowance } from '@/features/limits/hooks';
import {
  useTemplateErrorMessage,
  useTemplates,
  useTemplatesInUse,
} from '@/features/templates/hooks';
import type {
  Template,
  TemplateLanguage,
  TemplateScope,
} from '@/features/templates/types';
import { useTranslations } from '@/lib/i18n';

import { TemplateCard } from './template-card';
import { TemplateFilters } from './template-filters';
import { TemplateSearchField } from './template-search-field';

const SEARCH_DELAY_MS = 300;

function useDebounced(value: string) {
  const [settled, setSettled] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setSettled(value), SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [value]);

  return settled;
}

export function TemplatesScreen() {
  const { t, locale } = useTranslations();
  const theme = useTheme();
  const router = useRouter();
  const toMessage = useTemplateErrorMessage();
  const tabBarInset = useTabBarInset();
  const allowance = useAllowance('template');
  const inUse = useTemplatesInUse();

  const [query, setQuery] = useState('');
  const [scope, setScope] = useState<TemplateScope>('all');
  const [language, setLanguage] = useState<TemplateLanguage | null>(locale);
  const q = useDebounced(query);

  const {
    data: templates,
    isPending,
    error,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useTemplates({
    q,
    scope,
    ...(language === null || scope === 'mine' ? {} : { language }),
  });

  const open = useCallback(
    (template: Template) =>
      router.push({ pathname: '/templates/[id]', params: { id: template.id } }),
    [router],
  );

  const clearFilters = () => {
    setQuery('');
    setScope('all');
    setLanguage(locale);
  };

  const filtered =
    q.trim() !== '' || scope === 'official' || scope === 'community';

  const empty = isPending ? (
    <ScreenLoader />
  ) : error ? null : filtered ? (
    <EmptyState
      Icon={SearchX}
      title={t('templates.empty.filteredTitle')}
      body={t('templates.empty.filteredBody')}
      action={{ label: t('templates.empty.clear'), onPress: clearFilters }}
    />
  ) : scope === 'mine' ? (
    <EmptyState
      Icon={LayoutTemplate}
      title={t('templates.empty.mineTitle')}
      body={t('templates.empty.mineBody')}
      action={
        allowance.canCreate
          ? {
              label: t('templates.new'),
              Icon: Plus,
              onPress: () => router.push('/templates/new'),
            }
          : undefined
      }
    />
  ) : (
    <EmptyState
      Icon={LayoutTemplate}
      title={t('templates.empty.title')}
      body={t('templates.empty.body')}
    />
  );

  return (
    <YStack flex={1} bg="$background">
      <YStack
        gap={SPACING.items}
        px={SPACING.screen}
        pt={SPACING.group}
        pb={SPACING.items}
      >
        <TemplateSearchField value={query} onChange={setQuery} />
        <TemplateFilters
          scope={scope}
          language={language}
          showLanguages={scope !== 'mine'}
          onScope={setScope}
          onLanguage={setLanguage}
        />
      </YStack>

      <FlatList
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: tabBarInset }}
        data={templates ?? []}
        extraData={inUse}
        keyExtractor={(template) => template.id}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        refreshControl={
          <RefreshControl
            refreshing={isRefetching && !isFetchingNextPage}
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
          <YStack
            gap={SPACING.items}
            px={SPACING.screen}
            pb={scope === 'mine' || error ? SPACING.items : 0}
          >
            {scope === 'mine' && (
              <PlanLimitNotice allowance={allowance} resource="template" />
            )}
            <ErrorNotice message={toMessage(error)} />
          </YStack>
        }
        renderItem={({ item }) => (
          <YStack px={SPACING.screen} pb={SPACING.items}>
            <TemplateCard
              template={item}
              inUse={inUse.has(item.id)}
              onOpen={open}
            />
          </YStack>
        )}
        ListEmptyComponent={empty}
        ListFooterComponent={
          isFetchingNextPage ? (
            <XStack justify="center" py={SPACING.items}>
              <Spinner color="$primary" />
            </XStack>
          ) : null
        }
      />
    </YStack>
  );
}
