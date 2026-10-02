import { BadgeCheck } from '@tamagui/lucide-icons-2/icons/BadgeCheck';
import { Languages } from '@tamagui/lucide-icons-2/icons/Languages';
import { LayoutGrid } from '@tamagui/lucide-icons-2/icons/LayoutGrid';
import { User } from '@tamagui/lucide-icons-2/icons/User';
import { Users } from '@tamagui/lucide-icons-2/icons/Users';
import { XStack, YStack } from 'tamagui';

import { Chip } from '@/components/common/chip';
import {
  SegmentedControl,
  type Segment,
} from '@/components/common/segmented-control';
import { SPACING } from '@/constants/layout';
import {
  TEMPLATE_LANGUAGES,
  type TemplateLanguage,
  type TemplateScope,
} from '@/features/templates/types';
import { useTranslations } from '@/lib/i18n';

import { LANGUAGE_NAMES } from './template-labels';

export function TemplateFilters({
  scope,
  language,
  showLanguages,
  onScope,
  onLanguage,
}: {
  scope: TemplateScope;
  language: TemplateLanguage | null;
  showLanguages: boolean;
  onScope: (scope: TemplateScope) => void;
  onLanguage: (language: TemplateLanguage | null) => void;
}) {
  const { t } = useTranslations();

  const scopes: readonly Segment<TemplateScope>[] = [
    { value: 'all', label: t('templates.scope.all'), Icon: LayoutGrid },
    {
      value: 'official',
      label: t('templates.scope.official'),
      Icon: BadgeCheck,
    },
    {
      value: 'community',
      label: t('templates.scope.community'),
      Icon: Users,
    },
    { value: 'mine', label: t('templates.scope.mine'), Icon: User },
  ];

  return (
    <YStack gap={SPACING.items}>
      <SegmentedControl segments={scopes} value={scope} onChange={onScope} />

      {showLanguages && (
        <XStack flexWrap="wrap" items="center" gap="$1.5">
          <Chip
            label={t('templates.language.all')}
            Icon={Languages}
            selected={language === null}
            onPress={() => onLanguage(null)}
          />
          {TEMPLATE_LANGUAGES.map((code) => (
            <Chip
              key={code}
              label={LANGUAGE_NAMES[code]}
              selected={language === code}
              onPress={() => onLanguage(language === code ? null : code)}
            />
          ))}
        </XStack>
      )}
    </YStack>
  );
}
