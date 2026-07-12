import settingsConfig from "../../../constants/config/settings-config.mjs";
import {
  CommonDocumentSettingsModel,
  documentSettingsModelFactory,
  userSettingsModelFactory,
} from "./settings-model-factories.mjs";

export { CommonDocumentSettingsModel };
export const userSettingsModels = Object.fromEntries(
  Object.keys(settingsConfig.categories).map((k) => [k, userSettingsModelFactory(k)]),
);
export const documentSettingsModels = Object.fromEntries(
  Object.keys(settingsConfig.compositions).map((k) => [k, documentSettingsModelFactory(k)]),
);
