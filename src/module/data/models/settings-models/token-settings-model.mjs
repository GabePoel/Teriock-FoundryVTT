import EmbeddedDataModel from "../embedded-data-model.mjs";

const { fields } = foundry.data;

export default class TokenSettingsModel extends EmbeddedDataModel {
  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      autoColoration: new fields.BooleanField({
        label: game.i18n.localize(
          "TERIOCK.MODELS.TokenSettings.autoColoration.label",
        ),
        initial: true,
        hint: game.i18n.localize(
          "TERIOCK.MODELS.TokenSettings.autoColoration.hint",
        ),
      }),
      autoDetectionModes: new fields.BooleanField({
        hint: game.i18n.localize(
          "TERIOCK.MODELS.TokenSettings.autoDetectionModes.hint",
        ),
        initial: true,
        label: game.i18n.localize(
          "TERIOCK.MODELS.TokenSettings.autoDetectionModes.label",
        ),
      }),
      autoLighting: new fields.BooleanField({
        label: game.i18n.localize(
          "TERIOCK.MODELS.TokenSettings.autoLighting.label",
        ),
        initial: true,
        hint: game.i18n.localize(
          "TERIOCK.MODELS.TokenSettings.autoLighting.hint",
        ),
      }),
      autoMagic: new fields.BooleanField({
        label: game.i18n.localize(
          "TERIOCK.MODELS.TokenSettings.autoMagic.label",
        ),
        initial: true,
        hint: game.i18n.localize("TERIOCK.MODELS.TokenSettings.autoMagic.hint"),
      }),
      autoScale: new fields.BooleanField({
        label: game.i18n.localize(
          "TERIOCK.MODELS.TokenSettings.autoScale.label",
        ),
        initial: true,
        hint: game.i18n.localize("TERIOCK.MODELS.TokenSettings.autoScale.hint"),
      }),
      autoTransformation: new fields.BooleanField({
        label: game.i18n.localize(
          "TERIOCK.MODELS.TokenSettings.autoTransformation.label",
        ),
        initial: true,
        hint: game.i18n.localize(
          "TERIOCK.MODELS.TokenSettings.autoTransformation.hint",
        ),
      }),
      autoVisionAngle: new fields.BooleanField({
        hint: game.i18n.localize(
          "TERIOCK.MODELS.TokenSettings.autoVisionAngle.hint",
        ),
        initial: true,
        label: game.i18n.localize(
          "TERIOCK.MODELS.TokenSettings.autoVisionAngle.label",
        ),
      }),
      autoVisionModes: new fields.BooleanField({
        label: game.i18n.localize(
          "TERIOCK.MODELS.TokenSettings.autoVisionModes.label",
        ),
        initial: true,
        hint: game.i18n.localize(
          "TERIOCK.MODELS.TokenSettings.autoVisionModes.hint",
        ),
      }),
      autoVisionRange: new fields.BooleanField({
        label: game.i18n.localize(
          "TERIOCK.MODELS.TokenSettings.autoVisionRange.label",
        ),
        initial: true,
        hint: game.i18n.localize(
          "TERIOCK.MODELS.TokenSettings.autoVisionRange.hint",
        ),
      }),
    });
  }
}
