import {
  CommonDocumentSettingsModel,
  DocumentSettingsModelFactory,
  UserSettingsModelFactory,
} from "./settings-model-factories.mjs";

export { CommonDocumentSettingsModel };
export const userSettingsModels = Object.fromEntries(
  Object.keys(TERIOCK.CONFIG.documentBehavior.categories).map((k) => [k, UserSettingsModelFactory(k)]),
);
export const documentSettingsModels = Object.fromEntries(
  Object.keys(TERIOCK.CONFIG.documentBehavior.compositions).map((k) => [k, DocumentSettingsModelFactory(k)]),
);
