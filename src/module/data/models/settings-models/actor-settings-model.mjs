import characterConfig from "../../../constants/config/character-config.mjs";
import { blockGaplessField, blockSizeField } from "../../fields/helpers/builders.mjs";
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
      sheet: new fields.SchemaField(characterConfig.tabs.reduce((fields, { gapless, key, size }) => {
        const childPath = `TERIOCK.SHEETS.Actor.TABS.${key}.title`;
        fields[`block${key}Gapless`] = new blockGaplessField({
          child: childPath,
          ...(gapless !== undefined && { initial: gapless }),
        });
        fields[`block${key}Size`] = new blockSizeField({
          child: childPath,
          ...(size !== undefined && { initial: size }),
        });
        return fields;
      }, {})),
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
