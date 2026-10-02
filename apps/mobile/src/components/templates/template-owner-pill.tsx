import { BadgeCheck } from '@tamagui/lucide-icons-2/icons/BadgeCheck';
import { User } from '@tamagui/lucide-icons-2/icons/User';
import { Users } from '@tamagui/lucide-icons-2/icons/Users';

import { HeaderPill } from '@/components/common/header-pill';
import type { Template } from '@/features/templates/types';
import { useTranslations } from '@/lib/i18n';

export function TemplateOwnerPill({ template }: { template: Template }) {
  const { t } = useTranslations();

  if (template.owned) {
    return <HeaderPill label={t('templates.yours')} Icon={User} />;
  }

  const { name, official } = template.publisher;
  return (
    <HeaderPill
      label={name}
      Icon={official ? BadgeCheck : Users}
      accent={official}
    />
  );
}
