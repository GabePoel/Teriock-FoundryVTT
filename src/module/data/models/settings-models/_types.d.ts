import { DataField } from "@common/data/fields.mjs";

import EmbeddedDataModel from "../embedded-data-model.mjs";

declare global {
  namespace Teriock.Models {
    export type SettingsDefaults<Category extends Teriock.Config.SettingsCategory> = {
      [Key in Teriock.Config.SettingsKey<Category>]: boolean;
    };

    export type DocumentSettingsValues<Category extends Teriock.Config.SettingsCategory> = {
      [Key in Teriock.Config.SettingsKey<Category>]: boolean | null;
    };

    export type DocumentSettingsModelData<
      Category extends Teriock.Config.SettingsCategory = Teriock.Config.SettingsCategory,
    > = DocumentSettingsValues<Category> & {
      getSetting<Key extends Teriock.Config.SettingsKey<Category>>(setting: Key): boolean;
    };

    export type UserSettingsModelData<
      Category extends Teriock.Config.SettingsCategory = Teriock.Config.SettingsCategory,
    > = SettingsDefaults<Category>;

    export type CommonSettingsModelData = Record<string, never>;

    export type DocumentSettingsModelInstance<Category extends Teriock.Config.SettingsCategory> =
      & DocumentSettingsModelData<Category>
      & EmbeddedDataModel;

    export type UserSettingsModelInstance<Category extends Teriock.Config.SettingsCategory> =
      & UserSettingsModelData<Category>
      & EmbeddedDataModel;

    export interface DocumentSettingsModelConstructor<Category extends Teriock.Config.SettingsCategory> {
      new(...args: object[]): DocumentSettingsModelInstance<Category>;
      CATEGORY: Category;
      defineSchema(): Record<string, DataField>;
    }

    export interface UserSettingsModelConstructor<Category extends Teriock.Config.SettingsCategory> {
      new(...args: object[]): UserSettingsModelInstance<Category>;
      CATEGORY: Category;
      defineSchema(): Record<string, DataField>;
    }

    export type DocumentSettingsModelConstructorMap = {
      [Category in Teriock.Config.SettingsCategory]: DocumentSettingsModelConstructor<Category>;
    };

    export type UserSettingsModelConstructorMap = {
      [Category in Teriock.Config.SettingsCategory]: UserSettingsModelConstructor<Category>;
    };

    export type AbilitySettingsModel = DocumentSettingsModelInstance<"ability">;
    export type ActorSettingsModel = DocumentSettingsModelInstance<"actor">;
    export type ArmamentSettingsModel = DocumentSettingsModelInstance<"armament">;
    export type CommonSettingsModel = EmbeddedDataModel & CommonSettingsModelData;
  }
}

export {};
