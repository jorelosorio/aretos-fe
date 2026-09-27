import { CardList } from './card-list';
import { FormSection } from './form-section';
import type { IconComponent } from './icon-component';
import { ListRow } from './list-row';

export type Option<T extends string> = {
  value: T;
  label: string;
  hint?: string;
  Icon: IconComponent;
};

export function OptionGroup<T extends string>({
  title,
  options,
  value,
  onChange,
}: {
  title: string;
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <FormSection title={title}>
      <CardList>
        {options.map((option) => (
          <ListRow
            key={option.value}
            label={option.label}
            hint={option.hint}
            Icon={option.Icon}
            selected={option.value === value}
            onPress={() => onChange(option.value)}
          />
        ))}
      </CardList>
    </FormSection>
  );
}
