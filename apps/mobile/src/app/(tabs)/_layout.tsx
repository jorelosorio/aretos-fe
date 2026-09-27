import { Tabs } from 'expo-router';
import { useTheme } from '@tamagui/core';
import { ChartNoAxesColumn } from '@tamagui/lucide-icons-2/icons/ChartNoAxesColumn';
import { House } from '@tamagui/lucide-icons-2/icons/House';
import { NotebookPen } from '@tamagui/lucide-icons-2/icons/NotebookPen';
import { Settings } from '@tamagui/lucide-icons-2/icons/Settings';
import { Target } from '@tamagui/lucide-icons-2/icons/Target';

import { FloatingTabBar } from '@/components/common/floating-tab-bar';
import { NewGoalButton } from '@/components/goals/new-goal-button';
import { HEADER_INSET, HEADER_TITLE, ICON } from '@/constants/layout';
import { useTranslations } from '@/lib/i18n';

const iconColor = (focused: boolean) =>
  focused ? '$primary' : '$mutedForeground';

export default function TabsLayout() {
  const theme = useTheme();
  const { t } = useTranslations();

  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        freezeOnBlur: true,
        sceneStyle: { backgroundColor: theme.background.val },
        headerStyle: { backgroundColor: theme.background.val },
        headerShadowVisible: false,
        headerRightContainerStyle: { paddingRight: HEADER_INSET },
        headerTintColor: theme.color.val,
        headerTitleStyle: {
          fontFamily: HEADER_TITLE.fontFamily,
          fontSize: HEADER_TITLE.fontSize,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <House color={iconColor(focused)} size={ICON.feature} />
          ),
        }}
      />
      <Tabs.Screen
        name="diary"
        options={{
          title: t('tabs.diary'),
          tabBarIcon: ({ focused }) => (
            <NotebookPen color={iconColor(focused)} size={ICON.feature} />
          ),
        }}
      />
      <Tabs.Screen
        name="analysis"
        options={{
          title: t('tabs.analysis'),
          tabBarIcon: ({ focused }) => (
            <ChartNoAxesColumn color={iconColor(focused)} size={ICON.feature} />
          ),
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: t('tabs.goals'),
          headerRight: () => <NewGoalButton />,
          tabBarIcon: ({ focused }) => (
            <Target color={iconColor(focused)} size={ICON.feature} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabs.settings'),
          tabBarIcon: ({ focused }) => (
            <Settings color={iconColor(focused)} size={ICON.feature} />
          ),
        }}
      />
    </Tabs>
  );
}
