import { Tag } from '@tamagui/lucide-icons-2/icons/Tag';

import { Chip, type ChipProps } from '@/components/common/chip';
import { capitalize } from '@/utils/text';

export function TagChip({
  label,
  icon = true,
  ...chip
}: Omit<ChipProps, 'Icon' | 'dot'> & { icon?: boolean }) {
  return (
    <Chip {...chip} label={capitalize(label)} Icon={icon ? Tag : undefined} />
  );
}
