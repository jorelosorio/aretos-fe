import { Tabs } from 'expo-router';
import { useTheme } from '@tamagui/core';
import {
  ChartNoAxesColumn,
  House,
  NotebookPen,
  Target,
} from '@tamagui/lucide-icons-2';

// matches the reference sidebar: the active icon takes --primary, the rest --muted-foreground
const iconColor = (focused: boolean) =>
  focused ? '$primary' : '$mutedForeground';

export default function TabsLayout() {
  const theme = useTheme();

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
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ focused }) => (
            <House color={iconColor(focused)} size={22} />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progreso',
          tabBarIcon: ({ focused }) => (
            <ChartNoAxesColumn color={iconColor(focused)} size={22} />
          ),
        }}
      />
      <Tabs.Screen
        name="diary"
        options={{
          title: 'Diario',
          tabBarIcon: ({ focused }) => (
            <NotebookPen color={iconColor(focused)} size={22} />
          ),
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: 'Mis Metas',
          tabBarIcon: ({ focused }) => (
            <Target color={iconColor(focused)} size={22} />
          ),
        }}
      />
    </Tabs>
  );
}
