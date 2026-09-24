import {
  SegmentedControl,
  type Segment,
} from '@/components/common/segmented-control';
import { ANALYSIS_WINDOWS, type AnalysisWindow } from '@/features/analysis';
import { useTranslations } from '@/lib/i18n';

export function WindowFilter({
  value,
  onChange,
}: {
  value: AnalysisWindow;
  onChange: (value: AnalysisWindow) => void;
}) {
  const { t } = useTranslations();

  const segments: Segment<string>[] = ANALYSIS_WINDOWS.map((days) => ({
    value: String(days),
    label: t(`analysis.window.${days}`),
  }));

  return (
    <SegmentedControl
      segments={segments}
      value={String(value)}
      onChange={(next) => onChange(Number(next) as AnalysisWindow)}
    />
  );
}
