import { DataField } from "@common/data/fields.mjs";

import { BaseDataModel } from "../../abstract/_module.mjs";

declare global {
  namespace Teriock.Models {
    export type SettingsDefaults<Category extends Teriock.Behavior.SettingsCategory> = {
      [Key in Teriock.Behavior.SettingsKey<Category>]: boolean;
    };

    export type DocumentSettingsValues<Category extends Teriock.Behavior.DocumentSettingsCategory> = {
      [Key in Teriock.Behavior.ComposedSettingsKey<Category>]: boolean | null;
    };

    export type DocumentSettingsModelData<
      Category extends Teriock.Behavior.DocumentSettingsCategory = Teriock.Behavior.DocumentSettingsCategory,
    > = DocumentSettingsValues<Category> & {
      getSetting<Key extends Teriock.Behavior.ComposedSettingsKey<Category>>(setting: Key): boolean;
    };

    export type UserSettingsModelData<
      Category extends Teriock.Behavior.SettingsCategory = Teriock.Behavior.SettingsCategory,
    > = SettingsDefaults<Category>;

    export type DocumentSettingsModelInstance<Category extends Teriock.Behavior.DocumentSettingsCategory> =
      & DocumentSettingsModelData<Category>
      & BaseDataModel;

    export type UserSettingsModelInstance<Category extends Teriock.Behavior.SettingsCategory> =
      & UserSettingsModelData<Category>
      & BaseDataModel;

    export interface DocumentSettingsModelConstructor<Category extends Teriock.Behavior.DocumentSettingsCategory> {
      new(...args: object[]): DocumentSettingsModelInstance<Category>;
      CATEGORY: Category;
      KEY_GROUPS: Record<string, Teriock.Behavior.SettingsCategory>;
      defineSchema(): Record<string, DataField>;
    }

    export interface UserSettingsModelConstructor<Category extends Teriock.Behavior.SettingsCategory> {
      new(...args: object[]): UserSettingsModelInstance<Category>;
      CATEGORY: Category;
      defineSchema(): Record<string, DataField>;
    }
  }
}

export {};
