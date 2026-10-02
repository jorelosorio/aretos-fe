import { FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CircleAlert } from '@tamagui/lucide-icons-2/icons/CircleAlert';
import { CircleCheck } from '@tamagui/lucide-icons-2/icons/CircleCheck';
import { Hourglass } from '@tamagui/lucide-icons-2/icons/Hourglass';
import { Languages } from '@tamagui/lucide-icons-2/icons/Languages';
import { ListChecks } from '@tamagui/lucide-icons-2/icons/ListChecks';
import { Lock } from '@tamagui/lucide-icons-2/icons/Lock';
import { Users } from '@tamagui/lucide-icons-2/icons/Users';
import { YStack } from 'tamagui';

import { EmptySlot } from '@/components/common/empty-slot';
import type { IconComponent } from '@/components/common/icon-component';
import { Notice } from '@/components/common/notice';
import { SectionTitle } from '@/components/common/section-title';
import { GoalSummary } from '@/components/goals/goal-summary';
import { PlanLimitNotice } from '@/components/goals/plan-limit-notice';
import { HabitCard } from '@/components/habits/habit-card';
import { SPACING } from '@/constants/layout';
import { useAllowance } from '@/features/limits/hooks';
import { useTemplatesInUse } from '@/features/templates/hooks';
import type { Template } from '@/features/templates/types';
import { useTranslations, type TranslationKey } from '@/lib/i18n';

import {
  LANGUAGE_NAMES,
  templateStatus,
  type TemplateStatus,
} from './template-labels';

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

export function TemplateDetail({ template }: { template: Template }) {
  const { t } = useTranslations();
  const insets = useSafeAreaInsets();
  const goals = useAllowance('goal');
  const inUse = useTemplatesInUse().has(template.id);

  const uses =
    template.uses === 0
      ? undefined
      : t(template.uses === 1 ? 'templates.usesOne' : 'templates.usesMany', {
          count: template.uses,
        });

  return (
    <YStack flex={1} bg="$background">
      <FlatList
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: insets.bottom + SPACING.sectionPx,
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
            {!goals.canCreate && <PlanLimitNotice allowance={goals} />}

            <GoalSummary
              name={template.name}
              badges={[
                { label: LANGUAGE_NAMES[template.language], Icon: Languages },
                ...(inUse
                  ? [
                      {
                        label: t('templates.inUse'),
                        Icon: CircleCheck,
                        highlighted: true,
                      },
                    ]
                  : []),
              ]}
              caption={uses}
              description={template.description}
              habitCount={template.habits.length}
              trackingFrequency={template.trackingFrequency}
              streakRule={template.streakRule}
              streakThreshold={template.streakThreshold}
            />

            <StatusNotice template={template} />

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
    </YStack>
  );
}
