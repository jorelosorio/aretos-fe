import { Stack } from 'expo-router';

import { CloseButton } from '@/components/common/close-button';
import { useStackHeaderOptions } from '@/components/common/stack-header';
import { useTranslations } from '@/lib/i18n';

export default function LogsLayout() {
  const { t } = useTranslations();
  const headerOptions = useStackHeaderOptions();

  return (
    <Stack screenOptions={{ ...headerOptions, headerShown: true }}>
      <Stack.Screen
        name="new"
        options={{
          title: t('logs.pickTitle'),
          headerLeft: () => <CloseButton />,
        }}
      />
      <Stack.Screen
        name="[goalId]"
        options={({ route, navigation }) => ({
          title: '',
          headerLeft:
            navigation.getState().routes[0]?.key === route.key
              ? () => <CloseButton />
              : undefined,
        })}
      />
    </Stack>
  );
}
