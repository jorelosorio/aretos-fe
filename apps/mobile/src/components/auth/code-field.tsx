import { useState } from 'react';

import { FormInput } from '@/components/common/form-field';
import { FormSection } from '@/components/common/form-section';
import { TEXT } from '@/constants/layout';
import { CODE_LENGTH, codeError, toCode } from '@/features/auth/credentials';
import { useTranslations } from '@/lib/i18n';

const DIGIT_SPACING = 8;

export function CodeField({
  value,
  onChange,
}: {
  value: string;
  onChange: (code: string) => void;
}) {
  const { t } = useTranslations();
  const [touched, setTouched] = useState(false);
  const error = touched ? codeError(value) : null;

  return (
    <FormSection
      title={t('auth.fields.code')}
      error={error === null ? undefined : t(`auth.fieldErrors.${error}`)}
    >
      <FormInput
        accessibilityLabel={t('auth.fields.code')}
        value={value}
        onChangeText={(text) => onChange(toCode(text))}
        onBlur={() => setTouched(true)}
        placeholder={'0'.repeat(CODE_LENGTH)}
        autoFocus
        autoComplete="one-time-code"
        textContentType="oneTimeCode"
        keyboardType="number-pad"
        maxLength={CODE_LENGTH}
        fontSize={TEXT.display}
        letterSpacing={DIGIT_SPACING}
        text="center"
      />
    </FormSection>
  );
}
