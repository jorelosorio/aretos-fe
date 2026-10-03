import { XStack, YStack } from 'tamagui';

import { AuthorLabel } from '@/components/common/author-label';
import { BodyText } from '@/components/common/body-text';
import { SPACING } from '@/constants/layout';

import { GoalName } from './goal-name';

const AUTHOR_MAX_WIDTH = '40%';

export function GoalHeading({
  name,
  slot,
  author,
  description,
  lines,
}: {
  name: string;
  slot?: number;
  author?: { name: string; official: boolean };
  description: string;
  lines?: number;
}) {
  return (
    <YStack gap={SPACING.text}>
      <XStack items="flex-start" gap={SPACING.items}>
        <GoalName slot={slot} name={name} lines={lines} />
        {author !== undefined && (
          <XStack maxW={AUTHOR_MAX_WIDTH} pt="$0.5" justify="flex-end">
            <AuthorLabel name={author.name} official={author.official} />
          </XStack>
        )}
      </XStack>

      {description !== '' && (
        <BodyText tone="muted" numberOfLines={lines}>
          {description}
        </BodyText>
      )}
    </YStack>
  );
}
