import EmbeddedDataModel from "../embedded-data-model.mjs";

const { fields } = foundry.data;

/**
 * Per-actor document behavior and display settings.
 * @extends {Teriock.Models.ActorSettingsModelData}
 */
export default class ActorSettingsModel extends EmbeddedDataModel {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "TERIOCK.MODELS.ActorSettings",
    "TERIOCK.MODELS.CommonSettings",
  ];

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      automation: new fields.SchemaField({
        nonHierarchicalChanges: new fields.BooleanField({
          hint: "TERIOCK.SETTINGS.nonHierarchicalChanges.hint",
          initial: true,
          label: "TERIOCK.SETTINGS.nonHierarchicalChanges.name",
        }),
        payAbilityCosts: new fields.BooleanField({
          hint: "TERIOCK.SETTINGS.autoPayAbilityCosts.hint",
          initial: true,
          label: "TERIOCK.SETTINGS.autoPayAbilityCosts.name",
        }),
        wound: new fields.BooleanField({ initial: true }),
      }),
      token: new fields.SchemaField({
        autoColoration: new fields.BooleanField({ initial: true }),
        autoDetectionModes: new fields.BooleanField({ initial: true }),
        autoLighting: new fields.BooleanField({ initial: true }),
        autoMagic: new fields.BooleanField({ initial: true }),
        autoScale: new fields.BooleanField({ initial: true }),
        autoTransformation: new fields.BooleanField({ initial: true }),
        autoVisionAngle: new fields.BooleanField({ initial: true }),
        autoVisionModes: new fields.BooleanField({ initial: true }),
        autoVisionRange: new fields.BooleanField({ initial: true }),
      }),
    });
  }
}
