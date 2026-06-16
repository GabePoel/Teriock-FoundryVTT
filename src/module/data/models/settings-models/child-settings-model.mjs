import EmbeddedDataModel from "../embedded-data-model.mjs";

/**
 * Per-child-document settings.
 * @extends {Teriock.Models.ChildSettingsModelData}
 */
export default class ChildSettingsModel extends EmbeddedDataModel {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.MODELS.CommonSettings"];
}
