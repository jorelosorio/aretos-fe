import { Children, Fragment, isValidElement, type ReactNode } from 'react';
import { Separator } from 'tamagui';

import { Card } from './card';

export function CardList({ children }: { children: ReactNode }) {
  const rows = Children.toArray(children);

  return (
    <Card density="flush">
      {rows.map((row, index) => (
        <Fragment
          key={isValidElement(row) && row.key !== null ? row.key : index}
        >
          {index > 0 && <Separator borderColor="$border" />}
          {row}
        </Fragment>
      ))}
    </Card>
  );
}
