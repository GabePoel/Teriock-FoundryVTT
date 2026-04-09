import ChildSettingsModel from "./child-settings-model.mjs";

const { fields } = foundry.data;

export default class AbilitySettingsModel extends ChildSettingsModel {
  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      promptCostGp: new fields.BooleanField({
        hint: _loc("TERIOCK.MODELS.AbilitySettings.promptCostGp.hint"),
        initial: true,
        label: _loc("TERIOCK.MODELS.AbilitySettings.promptCostGp.label"),
      }),
      promptCostHp: new fields.BooleanField({
        hint: _loc("TERIOCK.MODELS.AbilitySettings.promptCostHp.hint"),
        initial: true,
        label: _loc("TERIOCK.MODELS.AbilitySettings.promptCostHp.label"),
      }),
      promptCostLp: new fields.BooleanField({
        hint: _loc("TERIOCK.MODELS.AbilitySettings.promptCostLp.hint"),
        initial: true,
        label: _loc("TERIOCK.MODELS.AbilitySettings.promptCostLp.label"),
      }),
      promptCostMp: new fields.BooleanField({
        hint: _loc("TERIOCK.MODELS.AbilitySettings.promptCostMp.hint"),
        initial: true,
        label: _loc("TERIOCK.MODELS.AbilitySettings.promptCostMp.label"),
      }),
      promptHeighten: new fields.BooleanField({
        hint: _loc("TERIOCK.MODELS.AbilitySettings.promptHeighten.hint"),
        initial: true,
        label: _loc("TERIOCK.MODELS.AbilitySettings.promptHeighten.label"),
      }),
      promptTemplate: new fields.BooleanField({
        hint: _loc("TERIOCK.MODELS.AbilitySettings.promptTemplate.hint"),
        initial: true,
        label: _loc("TERIOCK.MODELS.AbilitySettings.promptTemplate.label"),
      }),
    });
  }
}
