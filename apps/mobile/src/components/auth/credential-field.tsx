import { useState } from 'react';
import { Eye } from '@tamagui/lucide-icons-2/icons/Eye';
import { EyeOff } from '@tamagui/lucide-icons-2/icons/EyeOff';
import { Button, YStack } from 'tamagui';

import { FormInput } from '@/components/common/form-field';
import { FormSection } from '@/components/common/form-section';
import { BUTTON, HIT_SLOP, ICON } from '@/constants/layout';
import {
  credentialError,
  type CredentialRule,
} from '@/features/auth/credentials';
import { useTranslations, type TranslationKey } from '@/lib/i18n';

const COPY = {
  name: {
    label: 'auth.fields.name',
    placeholder: 'auth.fields.namePlaceholder',
    autoComplete: 'name',
    textContentType: 'name',
  },
  email: {
    label: 'auth.fields.email',
    placeholder: 'auth.fields.emailPlaceholder',
    autoComplete: 'email',
    textContentType: 'emailAddress',
  },
  currentPassword: {
    label: 'auth.fields.password',
    placeholder: 'auth.fields.passwordPlaceholder',
    autoComplete: 'current-password',
    textContentType: 'password',
  },
  newPassword: {
    label: 'auth.fields.password',
    placeholder: 'auth.fields.passwordPlaceholder',
    autoComplete: 'new-password',
    textContentType: 'newPassword',
  },
} as const satisfies Record<
  CredentialRule,
  {
    label: TranslationKey;
    placeholder: TranslationKey;
    autoComplete: string;
    textContentType: string;
  }
>;

const TOGGLE_INSET = 6;

export function CredentialField({
  rule,
  value,
  onChange,
  label,
  error,
  autoFocus = false,
}: {
  rule: CredentialRule;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  autoFocus?: boolean;
}) {
  const { t } = useTranslations();
  const [touched, setTouched] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const copy = COPY[rule];
  const title = label ?? t(copy.label);
  const secret = rule === 'currentPassword' || rule === 'newPassword';
  const ruleError = touched ? credentialError(rule, value) : null;
  const ToggleIcon = revealed ? EyeOff : Eye;

  return (
    <FormSection
      title={title}
      hint={rule === 'newPassword' ? t('auth.fields.passwordHint') : undefined}
      error={
        ruleError === null ? error : t(`auth.fieldErrors.${ruleError}`)
      }
    >
      <YStack position="relative" justify="center">
        <FormInput
          accessibilityLabel={title}
          value={value}
          autoFocus={autoFocus}
          onChangeText={onChange}
          onBlur={() => setTouched(true)}
          placeholder={t(copy.placeholder)}
          autoComplete={copy.autoComplete}
          textContentType={copy.textContentType}
          autoCapitalize={rule === 'name' ? 'words' : 'none'}
          autoCorrect={false}
          keyboardType={rule === 'email' ? 'email-address' : 'default'}
          secureTextEntry={secret && !revealed}
          pr={secret ? '$9' : undefined}
        />
        {secret && (
          <Button
            position="absolute"
            r={TOGGLE_INSET}
            size={BUTTON.icon}
            circular
            chromeless
            hitSlop={HIT_SLOP}
            onPress={() => setRevealed((open) => !open)}
            icon={<ToggleIcon size={ICON.row} color="$mutedForeground" />}
            accessibilityLabel={t(
              revealed ? 'auth.fields.hide' : 'auth.fields.show',
            )}
          />
        )}
      </YStack>
    </FormSection>
  );
}
