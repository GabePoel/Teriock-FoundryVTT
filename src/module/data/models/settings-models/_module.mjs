import documentBehaviorConfig from "../../../constants/config/document-behavior-config.mjs";
import {
  CommonDocumentSettingsModel,
  DocumentSettingsModelFactory,
  UserSettingsModelFactory,
} from "./settings-model-factories.mjs";

export { CommonDocumentSettingsModel };
export const userSettingsModels = Object.fromEntries(
  Object.keys(documentBehaviorConfig.categories).map((k) => [k, UserSettingsModelFactory(k)]),
);
export const documentSettingsModels = Object.fromEntries(
  Object.keys(documentBehaviorConfig.compositions).map((k) => [k, DocumentSettingsModelFactory(k)]),
);
