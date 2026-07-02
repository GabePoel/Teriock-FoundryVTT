import settingsConfig from "../../../constants/config/settings-config.mjs";
import {
  CommonDocumentSettingsModel,
  documentSettingsModelFactory,
  userSettingsModelFactory,
} from "./settings-model-factories.mjs";

const keys = Object.keys(settingsConfig);

export { CommonDocumentSettingsModel };
export const userSettingsModels = Object.fromEntries(keys.map((k) => [k, userSettingsModelFactory(k)]));
export const documentSettingsModels = Object.fromEntries(keys.map((k) => [k, documentSettingsModelFactory(k)]));
