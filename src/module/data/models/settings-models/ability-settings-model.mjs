import ChildSettingsModel from "./child-settings-model.mjs";

const { fields } = foundry.data;

/**
 * Per-ability document behavior and display settings.
 * @extends {Teriock.Models.AbilitySettingsModelData}
 */
export default class AbilitySettingsModel extends ChildSettingsModel {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.MODELS.AbilitySettings"];

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      execution: new fields.SchemaField({
        promptCostGp: new fields.BooleanField({ initial: true }),
        promptCostHp: new fields.BooleanField({ initial: true }),
        promptCostLp: new fields.BooleanField({ initial: true }),
        promptCostMp: new fields.BooleanField({ initial: true }),
        promptHeighten: new fields.BooleanField({ initial: true }),
        promptTemplate: new fields.BooleanField({ initial: true }),
      }),
    });
  }
}
