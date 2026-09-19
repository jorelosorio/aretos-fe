import { YStack } from 'tamagui';

import { SignInForm } from '@/components/auth/sign-in-form';

export default function LoginScreen() {
  return (
    <YStack flex={1} items="center" justify="center" p="$6" bg="$background">
      <SignInForm />
    </YStack>
  );
}
