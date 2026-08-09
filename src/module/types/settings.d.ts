import { SettingConfig } from "@client/_types.mjs";

import { BaseMenu } from "../applications/menus/_module.mjs";

declare global {
  namespace Teriock.Settings {
    export type SettingEntry = Partial<SettingConfig> & { classes?: string[], stacked?: boolean };

    export type GroupEntry = {
      icon?: string;
      label?: string;
      settings: Record<string, SettingEntry>;
      template?: string;
    };

    export type MenuEntry = {
      application?: typeof BaseMenu;
      format?: "fieldsets" | "tabs";
      groups: Record<string, GroupEntry>;
      hint?: string;
      icon: string;
      label?: string;
      restricted?: boolean;
      title?: string;
    };
  }
}
