import type { ReactNode } from 'react';

import { CardList } from '@/components/common/card-list';
import { FormSection } from '@/components/common/form-section';
import type { IconComponent } from '@/components/common/icon-component';
import { ListRow } from '@/components/common/list-row';

export type Row = {
  label: string;
  onPress: () => void;
  Icon: IconComponent;
  hint?: string;
  busy?: boolean;
  disabled?: boolean;
  destructive?: boolean;
};

export function RowGroup({
  title,
  rows,
  children,
}: {
  title: string;
  rows: readonly Row[];
  children?: ReactNode;
}) {
  return (
    <FormSection title={title}>
      <CardList>
        {rows.map((row) => (
          <ListRow
            key={row.label}
            label={row.label}
            hint={row.hint}
            TrailingIcon={row.Icon}
            busy={row.busy}
            disabled={row.disabled}
            destructive={row.destructive}
            onPress={row.onPress}
          />
        ))}
        {children}
      </CardList>
    </FormSection>
  );
}
