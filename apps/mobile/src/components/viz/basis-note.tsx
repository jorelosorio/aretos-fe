import { SizableText } from 'tamagui';

import { TEXT } from '@/constants/layout';
import type { Basis } from '@/features/analysis';
import { useTranslations } from '@/lib/i18n';

export function BasisNote({ basis }: { basis: Basis }) {
  const { t } = useTranslations();

  const sample = t(`analysis.units.${basis.unit}`, { count: basis.count });

  return (
    <SizableText size={TEXT.caption} color="$mutedForeground">
      {basis.thin ? t('analysis.basis.thin', { sample }) : sample}
    </SizableText>
  );
}
