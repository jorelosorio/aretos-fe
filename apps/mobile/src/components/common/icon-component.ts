import type { Check } from '@tamagui/lucide-icons-2/icons/Check';

/**
 * Any lucide icon, as the component itself rather than an element.
 *
 * Options, menu actions and empty states carry their icon as data this way,
 * and the component that draws them decides its size and colour — so an icon
 * looks the same wherever the list it belongs to is rendered.
 */
export type IconComponent = typeof Check;
