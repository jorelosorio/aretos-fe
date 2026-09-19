import { Tabs } from 'expo-router';
import { useTheme } from '@tamagui/core';
import {
  ChartNoAxesColumn,
  House,
  NotebookPen,
  Target,
} from '@tamagui/lucide-icons-2';

import { SignOutButton } from '@/components/auth/sign-out-button';
import { useTranslations } from '@/lib/i18n';

// matches the reference sidebar: the active icon takes --primary, the rest --muted-foreground
const iconColor = (focused: boolean) =>
  focused ? '$primary' : '$mutedForeground';

export default function TabsLayout() {
  const theme = useTheme();
  const { t } = useTranslations();

  return (
    <Tabs
      screenOptions={{
        sceneStyle: { backgroundColor: theme.background.val },
        tabBarActiveTintColor: theme.sidebarAccentForeground.val,
        tabBarInactiveTintColor: theme.mutedForeground.val,
        tabBarStyle: {
          backgroundColor: theme.sidebar.val,
          borderTopColor: theme.sidebarBorder.val,
        },
        tabBarLabelStyle: { fontFamily: 'Nunito-SemiBold', fontSize: 12 },
        headerStyle: { backgroundColor: theme.background.val },
        headerShadowVisible: false,
        headerTintColor: theme.color.val,
        headerTitleStyle: { fontFamily: 'Caprasimo-Regular', fontSize: 20 },
        headerRight: () => <SignOutButton />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ focused }) => (
            <House color={iconColor(focused)} size={22} />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: t('tabs.progress'),
          tabBarIcon: ({ focused }) => (
            <ChartNoAxesColumn color={iconColor(focused)} size={22} />
          ),
        }}
      />
      <Tabs.Screen
        name="diary"
        options={{
          title: t('tabs.diary'),
          tabBarIcon: ({ focused }) => (
            <NotebookPen color={iconColor(focused)} size={22} />
          ),
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: t('tabs.goals'),
          tabBarIcon: ({ focused }) => (
            <Target color={iconColor(focused)} size={22} />
          ),
        }}
      />
    </Tabs>
  );
}
