import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus } from '@tamagui/lucide-icons-2';
import { Circle, styled, XStack, YStack } from 'tamagui';

import { ICON, TAB_BAR } from '@/constants/layout';

import type { TabBarProps } from './tab-bar-props';

const Slot = styled(YStack, {
  height: '100%',
  px: '$3',
  items: 'center',
  justify: 'center',
});

export function useTabBarInset() {
  const insets = useSafeAreaInsets();
  return insets.bottom + TAB_BAR.gap + TAB_BAR.height;
}

export function FloatingTabBar({
  state,
  descriptors,
  navigation,
  action,
}: TabBarProps & {
  action?: { label: string; onPress: () => void };
}) {
  const insets = useSafeAreaInsets();

  const tabs = state.routes.flatMap((route, index) => {
    const { options } = descriptors[route.key];
    const icon = options.tabBarIcon;

    if (icon === undefined) return [];

    const focused = state.index === index;

    const onPress = () => {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });

      if (!focused && !event.defaultPrevented) {
        navigation.navigate(route.name, route.params);
      }
    };

    return [
      <Slot
        key={route.key}
        onPress={onPress}
        pressStyle={{ opacity: 0.6 }}
        accessibilityRole="button"
        accessibilityState={{ selected: focused }}
        accessibilityLabel={options.title}
      >
        {icon({
          focused,
          color: focused ? '$primary' : '$mutedForeground',
          size: TAB_BAR.icon,
        })}
      </Slot>,
    ];
  });

  const middle = Math.ceil(tabs.length / 2);

  return (
    <XStack
      position="absolute"
      b={insets.bottom + TAB_BAR.gap}
      l={0}
      r={0}
      justify="center"
      pointerEvents="box-none"
    >
      <XStack
        height={TAB_BAR.height}
        items="center"
        gap="$2"
        px="$2"
        bg="$card"
        rounded={TAB_BAR.height / 2}
        borderWidth={1}
        borderColor="$border"
        elevation={4}
      >
        {tabs.slice(0, middle)}

        {action !== undefined && (
          <Slot
            onPress={action.onPress}
            pressStyle={{ opacity: 0.85 }}
            accessibilityRole="button"
            accessibilityLabel={action.label}
          >
            <Circle size="$3.5" items="center" justify="center" bg="$primary">
              <Plus size={ICON.feature} color="$primaryForeground" />
            </Circle>
          </Slot>
        )}

        {tabs.slice(middle)}
      </XStack>
    </XStack>
  );
}
