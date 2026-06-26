export { defineDocumentSettingsModel, documentSettingsModels } from "./document-settings-models.mjs";
export { default as CommonSettingsModel } from "./user-settings-models.mjs";
export {
  booleanSettingField,
  defineUserSettingsModel,
  settingsPath,
  userSettingsModels,
} from "./user-settings-models.mjs";

import { documentSettingsModels } from "./document-settings-models.mjs";

export const AbilitySettingsModel = documentSettingsModels.ability;
export const ActorSettingsModel = documentSettingsModels.actor;
export const ArmamentSettingsModel = documentSettingsModels.armament;
