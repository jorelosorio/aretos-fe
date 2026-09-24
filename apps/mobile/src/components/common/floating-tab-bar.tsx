import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Plus } from '@tamagui/lucide-icons-2';
import { Circle, styled, XStack, YStack } from 'tamagui';

import { ICON, TAB_BAR } from '@/constants/layout';

import type { TabBarProps } from './tab-bar-props';

type IconComponent = typeof Plus;

const Slot = styled(YStack, {
  flex: 1,
  height: '100%',
  items: 'center',
  justify: 'center',
});

export function useTabBarInset() {
  const insets = useSafeAreaInsets();
  return insets.bottom + TAB_BAR.gap * 2 + TAB_BAR.height;
}

export function FloatingTabBar({
  state,
  descriptors,
  navigation,
  action,
}: TabBarProps & {
  action?: { label: string; Icon: IconComponent; onPress: () => void };
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

  return (
    <XStack
      position="absolute"
      b={insets.bottom + TAB_BAR.gap}
      l={TAB_BAR.inset}
      r={TAB_BAR.inset}
      pointerEvents="box-none"
    >
      <XStack
        flex={1}
        height={TAB_BAR.height}
        items="center"
        px="$2"
        bg="$card"
        rounded={TAB_BAR.height / 2}
        borderWidth={1}
        borderColor="$border"
        shadowColor="#000"
        shadowOpacity={0.18}
        shadowRadius={20}
        shadowOffset={{ width: 0, height: 6 }}
        elevation={8}
      >
        {tabs}

        {action !== undefined && (
          <Slot
            onPress={action.onPress}
            pressStyle={{ opacity: 0.85 }}
            accessibilityRole="button"
            accessibilityLabel={action.label}
          >
            <Circle size="$3.5" items="center" justify="center" bg="$primary">
              <action.Icon size={ICON.feature} color="$primaryForeground" />
            </Circle>
          </Slot>
        )}
      </XStack>
    </XStack>
  );
}
