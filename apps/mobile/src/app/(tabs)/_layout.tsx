import { Tabs, useRouter } from 'expo-router';
import { useTheme } from '@tamagui/core';
import { House, NotebookPen, Settings, Target } from '@tamagui/lucide-icons-2';

import { FloatingTabBar } from '@/components/common/floating-tab-bar';
import { NewGoalButton } from '@/components/goals/new-goal-button';
import { HEADER_TITLE, ICON } from '@/constants/layout';
import { useTranslations } from '@/lib/i18n';

const iconColor = (focused: boolean) =>
  focused ? '$primary' : '$mutedForeground';

export default function TabsLayout() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslations();

  return (
    <Tabs
      tabBar={(props) => (
        <FloatingTabBar
          {...props}
          action={{
            label: t('tabs.log'),
            onPress: () => router.push('/logs/new'),
          }}
        />
      )}
      screenOptions={{
        sceneStyle: { backgroundColor: theme.background.val },
        headerStyle: { backgroundColor: theme.background.val },
        headerShadowVisible: false,
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
      <Tabs.Screen name="log" options={{ href: null }} />
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
