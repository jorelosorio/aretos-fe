import { CardList } from '@/components/common/card-list';
import { FormSection } from '@/components/common/form-section';
import type { IconComponent } from '@/components/common/icon-component';
import { ListRow } from '@/components/common/list-row';

export type Row = {
  label: string;
  onPress: () => void;
  Icon: IconComponent;
  busy?: boolean;
  disabled?: boolean;
};

export function RowGroup({
  title,
  rows,
}: {
  title: string;
  rows: readonly Row[];
}) {
  return (
    <FormSection title={title}>
      <CardList>
        {rows.map((row) => (
          <ListRow
            key={row.label}
            label={row.label}
            TrailingIcon={row.Icon}
            busy={row.busy}
            disabled={row.disabled}
            onPress={row.onPress}
          />
        ))}
      </CardList>
    </FormSection>
  );
}
