import { ActionsMenu, type MenuAction } from './actions-menu';
import type { IconComponent } from './icon-component';
import {
  HeaderActions,
  HeaderIconButton,
  HeaderTextButton,
} from './header-actions';

export type HeaderAction =
  | {
      kind: 'icon';
      Icon: IconComponent;
      label: string;
      onPress: () => void;
      disabled?: boolean;
    }
  | {
      kind: 'text';
      label: string;
      onPress: () => void;
      disabled?: boolean;
      busy?: boolean;
    }
  | {
      kind: 'menu';
      label: string;
      actions: readonly MenuAction[];
      disabled?: boolean;
    };

export function HeaderButtons({
  actions,
}: {
  actions: readonly HeaderAction[];
}) {
  return (
    <HeaderActions>
      {actions.map((action) => {
        switch (action.kind) {
          case 'icon':
            return (
              <HeaderIconButton
                key={action.label}
                Icon={action.Icon}
                label={action.label}
                onPress={action.onPress}
                disabled={action.disabled}
              />
            );
          case 'text':
            return (
              <HeaderTextButton
                key={action.label}
                label={action.label}
                onPress={action.onPress}
                disabled={action.disabled}
                busy={action.busy}
              />
            );
          case 'menu':
            return (
              <ActionsMenu
                key={action.label}
                label={action.label}
                actions={action.actions}
                disabled={action.disabled}
              />
            );
        }
      })}
    </HeaderActions>
  );
}
