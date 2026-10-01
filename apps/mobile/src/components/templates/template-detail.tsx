import { Alert, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CircleAlert } from '@tamagui/lucide-icons-2/icons/CircleAlert';
import { Hourglass } from '@tamagui/lucide-icons-2/icons/Hourglass';
import { ListChecks } from '@tamagui/lucide-icons-2/icons/ListChecks';
import { Lock } from '@tamagui/lucide-icons-2/icons/Lock';
import { Play } from '@tamagui/lucide-icons-2/icons/Play';
import { Users } from '@tamagui/lucide-icons-2/icons/Users';
import {
  Button,
  Paragraph,
  SizableText,
  Spinner,
  XStack,
  YStack,
} from 'tamagui';

import { Card } from '@/components/common/card';
import { EmptySlot } from '@/components/common/empty-slot';
import { ErrorNotice } from '@/components/common/error-notice';
import type { IconComponent } from '@/components/common/icon-component';
import { Notice } from '@/components/common/notice';
import { SectionTitle } from '@/components/common/section-title';
import { FREQUENCY_LABELS } from '@/components/goals/frequency-labels';
import { HabitCard } from '@/components/habits/habit-card';
import { TagChips } from '@/components/tags/tag-chips';
import { BUTTON, SPACING, TEXT } from '@/constants/layout';
import { useAllowance } from '@/features/limits/hooks';
import {
  useStartFromTemplate,
  useTemplateErrorMessage,
} from '@/features/templates/hooks';
import type { Template } from '@/features/templates/types';
import { useTranslations, type TranslationKey } from '@/lib/i18n';

import {
  LANGUAGE_NAMES,
  templateStatus,
  type TemplateStatus,
} from './template-labels';
import { TemplatePublisher } from './template-publisher';

const STATUS_NOTICES: Record<
  TemplateStatus,
  { Icon: IconComponent; title: TranslationKey; body: TranslationKey }
> = {
  private: {
    Icon: Lock,
    title: 'templates.notice.privateTitle',
    body: 'templates.notice.privateBody',
  },
  review: {
    Icon: Hourglass,
    title: 'templates.notice.reviewTitle',
    body: 'templates.notice.reviewBody',
  },
  rejected: {
    Icon: CircleAlert,
    title: 'templates.notice.rejectedTitle',
    body: 'templates.notice.rejectedBody',
  },
  shared: {
    Icon: Users,
    title: 'templates.notice.sharedTitle',
    body: 'templates.notice.sharedBody',
  },
};

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <YStack flex={1} gap={SPACING.text}>
      <SizableText size={TEXT.caption} color="$mutedForeground">
        {label}
      </SizableText>
      <SizableText size={TEXT.body} fontWeight="700" color="$cardForeground">
        {value}
      </SizableText>
    </YStack>
  );
}

function StatusNotice({ template }: { template: Template }) {
  const { t } = useTranslations();
  const status = templateStatus(template);

  if (status === null || template.review === null) return null;

  const { Icon, title, body } = STATUS_NOTICES[status];
  const approved = template.review.status === 'approved';
  const guidance = t(
    status === 'private' && approved
      ? 'templates.notice.privateApprovedBody'
      : body,
  );
  const note = status === 'rejected' ? template.review.note.trim() : '';

  return (
    <Notice
      Icon={Icon}
      title={t(title)}
      body={note === '' ? guidance : `${note}\n\n${guidance}`}
    />
  );
}

function TemplateSummary({
  template,
  onTag,
}: {
  template: Template;
  onTag: (tag: string) => void;
}) {
  const { t } = useTranslations();

  const streak =
    template.streakRule === 'threshold'
      ? `${template.streakThreshold}%`
      : t('goals.streak.loggedShort');

  return (
    <Card>
      <YStack gap={SPACING.group}>
        <XStack items="center" gap="$2" flexWrap="wrap">
          <TemplatePublisher publisher={template.publisher} />
          <SizableText size={TEXT.caption} color="$mutedForeground">
            ·
          </SizableText>
          <SizableText size={TEXT.caption} color="$mutedForeground">
            {LANGUAGE_NAMES[template.language]}
          </SizableText>
          {template.uses > 0 && (
            <>
              <SizableText size={TEXT.caption} color="$mutedForeground">
                ·
              </SizableText>
              <SizableText size={TEXT.caption} color="$mutedForeground">
                {t(
                  template.uses === 1
                    ? 'templates.usesOne'
                    : 'templates.usesMany',
                  { count: template.uses },
                )}
              </SizableText>
            </>
          )}
        </XStack>

        <SizableText size={TEXT.title} fontWeight="700" color="$cardForeground">
          {template.name}
        </SizableText>

        {template.description !== '' && (
          <Paragraph size={TEXT.body} color="$mutedForeground">
            {template.description}
          </Paragraph>
        )}
      </YStack>

      <TagChips tags={template.tags} onPress={onTag} filters="templates" />

      <XStack gap={SPACING.items} pt={SPACING.group}>
        <Stat
          label={t('goals.stats.habits')}
          value={String(template.habits.length)}
        />
        <Stat
          label={t('goals.stats.frequency')}
          value={t(FREQUENCY_LABELS[template.trackingFrequency])}
        />
        <Stat label={t('goals.stats.streak')} value={streak} />
      </XStack>
    </Card>
  );
}

export function TemplateDetail({ template }: { template: Template }) {
  const { t } = useTranslations();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toMessage = useTemplateErrorMessage();
  const goals = useAllowance('goal');

  const { startFromTemplate, isStarting, error } = useStartFromTemplate();

  const filterByTag = (tag: string) =>
    router.navigate({ pathname: '/templates', params: { tag } });

  const start = () =>
    void startFromTemplate(template.id)
      .then((goalId) =>
        router.replace({ pathname: '/goals/[id]', params: { id: goalId } }),
      )
      .catch((failure: unknown) =>
        Alert.alert(t('templates.errors.title'), toMessage(failure) ?? ''),
      );

  return (
    <YStack flex={1} bg="$background">
      <FlatList
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: SPACING.sectionPx,
        }}
        data={template.habits}
        keyExtractor={(habit, index) => `${index}-${habit.name}`}
        ListHeaderComponent={
          <YStack
            gap={SPACING.section}
            px={SPACING.screen}
            pt={SPACING.screen}
            pb={SPACING.group}
          >
            <TemplateSummary template={template} onTag={filterByTag} />

            <StatusNotice template={template} />

            <ErrorNotice message={toMessage(error)} />

            <SectionTitle>{t('habits.section')}</SectionTitle>
          </YStack>
        }
        renderItem={({ item }) => (
          <YStack px={SPACING.screen} pb={SPACING.items}>
            <HabitCard habit={item} />
          </YStack>
        )}
        ListEmptyComponent={
          <YStack px={SPACING.screen}>
            <EmptySlot Icon={ListChecks} label={t('templates.noHabits')} />
          </YStack>
        }
      />

      <YStack
        px={SPACING.screen}
        pt={SPACING.items}
        pb={insets.bottom + SPACING.sectionPx / 2}
        gap={SPACING.group}
        bg="$background"
      >
        {!goals.canCreate && (
          <Paragraph size={TEXT.caption} color="$mutedForeground" text="center">
            {t('templates.errors.goalLimitReached')}
          </Paragraph>
        )}
        <Button
          size={BUTTON.primary}
          theme="accent"
          icon={isStarting ? <Spinner /> : Play}
          disabled={isStarting || !goals.canCreate}
          opacity={goals.canCreate ? 1 : 0.4}
          onPress={start}
          accessibilityState={{ busy: isStarting, disabled: !goals.canCreate }}
        >
          {t('templates.start')}
        </Button>
      </YStack>
    </YStack>
  );
}
