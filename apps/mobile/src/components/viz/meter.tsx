import { SizableText, XStack, YStack, type ColorTokens } from 'tamagui';

import { TEXT } from '@/constants/layout';
import { useTranslations } from '@/lib/i18n';

import { formatRate, percentOf } from './format';

const TRACK_HEIGHT = 10;
const LABEL_WIDTH = 92;
const VALUE_WIDTH = 64;

export function Meter({
  label,
  rate,
  color = '$primary',
  caption,
  muted = false,
}: {
  label: string;
  rate: number | null;
  color?: ColorTokens;
  caption?: string;
  muted?: boolean;
}) {
  const { t } = useTranslations();
  const empty = t('analysis.empty');
  const percent = percentOf(rate);

  return (
    <XStack items="center" gap="$2.5">
      <YStack width={LABEL_WIDTH}>
        <SizableText size={TEXT.caption} color="$mutedForeground">
          {label}
        </SizableText>

        {caption !== undefined && (
          <SizableText
            size={TEXT.caption}
            color="$mutedForeground"
            opacity={0.7}
          >
            {caption}
          </SizableText>
        )}
      </YStack>

      <YStack
        flex={1}
        minW={0}
        height={TRACK_HEIGHT}
        rounded={TRACK_HEIGHT / 2}
        bg="$vizTrack"
        overflow="hidden"
      >
        {percent !== null && (
          <YStack
            height={TRACK_HEIGHT}
            width={`${percent}%`}
            rounded={TRACK_HEIGHT / 2}
            bg={muted ? '$vizBaseline' : color}
          />
        )}
      </YStack>

      <SizableText
        width={VALUE_WIDTH}
        text="right"
        size={TEXT.caption}
        fontWeight={rate === null ? '400' : '700'}
        color={rate === null ? '$mutedForeground' : '$cardForeground'}
      >
        {formatRate(rate, empty)}
      </SizableText>
    </XStack>
  );
}
