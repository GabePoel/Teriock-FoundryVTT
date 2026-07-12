import { DataField } from "@common/data/fields.mjs";

import { BaseDataModel } from "../../abstract/_module.mjs";

declare global {
  namespace Teriock.Models {
    export type SettingsDefaults<Category extends Teriock.Config.SettingsCategory> = {
      [Key in Teriock.Config.SettingsKey<Category>]: boolean;
    };

    export type DocumentSettingsValues<Category extends Teriock.Config.DocumentSettingsCategory> = {
      [Key in Teriock.Config.ComposedSettingsKey<Category>]: boolean | null;
    };

    export type DocumentSettingsModelData<
      Category extends Teriock.Config.DocumentSettingsCategory = Teriock.Config.DocumentSettingsCategory,
    > = DocumentSettingsValues<Category> & {
      getSetting<Key extends Teriock.Config.ComposedSettingsKey<Category>>(setting: Key): boolean;
    };

    export type UserSettingsModelData<
      Category extends Teriock.Config.SettingsCategory = Teriock.Config.SettingsCategory,
    > = SettingsDefaults<Category>;

    export type DocumentSettingsModelInstance<Category extends Teriock.Config.DocumentSettingsCategory> =
      & DocumentSettingsModelData<Category>
      & BaseDataModel;

    export type UserSettingsModelInstance<Category extends Teriock.Config.SettingsCategory> =
      & UserSettingsModelData<Category>
      & BaseDataModel;

    export interface DocumentSettingsModelConstructor<Category extends Teriock.Config.DocumentSettingsCategory> {
      new(...args: object[]): DocumentSettingsModelInstance<Category>;
      CATEGORY: Category;
      KEY_GROUPS: Record<string, Teriock.Config.SettingsCategory>;
      defineSchema(): Record<string, DataField>;
    }

    export interface UserSettingsModelConstructor<Category extends Teriock.Config.SettingsCategory> {
      new(...args: object[]): UserSettingsModelInstance<Category>;
      CATEGORY: Category;
      defineSchema(): Record<string, DataField>;
    }
  }
}

export {};
