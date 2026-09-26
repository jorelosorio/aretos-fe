import { Tag } from '@tamagui/lucide-icons-2';

import {
  Chip,
  type ChipLeading,
  type ChipProps,
} from '@/components/common/chip';
import { capitalize } from '@/utils/text';

const TAG_ICON = 11;

export const tagMark: ChipLeading = (active) => (
  <Tag
    size={TAG_ICON}
    color={active ? '$primaryForeground' : '$mutedForeground'}
  />
);

export function TagChip({
  label,
  icon = true,
  ...chip
}: Omit<ChipProps, 'leading'> & { icon?: boolean }) {
  return (
    <Chip
      {...chip}
      label={capitalize(label)}
      leading={icon ? tagMark : undefined}
    />
  );
}
