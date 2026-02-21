import ChildSettingsModel from "./child-settings-model.mjs";

const { fields } = foundry.data;

export default class AbilitySettingsModel extends ChildSettingsModel {
  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      promptCostGp: new fields.BooleanField({
        hint: game.i18n.localize(
          "TERIOCK.MODELS.AbilitySettings.promptCostGp.hint",
        ),
        initial: true,
        label: game.i18n.localize(
          "TERIOCK.MODELS.AbilitySettings.promptCostGp.label",
        ),
      }),
      promptCostHp: new fields.BooleanField({
        hint: game.i18n.localize(
          "TERIOCK.MODELS.AbilitySettings.promptCostHp.hint",
        ),
        initial: true,
        label: game.i18n.localize(
          "TERIOCK.MODELS.AbilitySettings.promptCostHp.label",
        ),
      }),
      promptCostMp: new fields.BooleanField({
        hint: game.i18n.localize(
          "TERIOCK.MODELS.AbilitySettings.promptCostMp.hint",
        ),
        initial: true,
        label: game.i18n.localize(
          "TERIOCK.MODELS.AbilitySettings.promptCostMp.label",
        ),
      }),
      promptHeighten: new fields.BooleanField({
        hint: game.i18n.localize(
          "TERIOCK.MODELS.AbilitySettings.promptHeighten.hint",
        ),
        initial: true,
        label: game.i18n.localize(
          "TERIOCK.MODELS.AbilitySettings.promptHeighten.label",
        ),
      }),
      promptTemplate: new fields.BooleanField({
        hint: game.i18n.localize(
          "TERIOCK.MODELS.AbilitySettings.promptTemplate.hint",
        ),
        initial: true,
        label: game.i18n.localize(
          "TERIOCK.MODELS.AbilitySettings.promptTemplate.label",
        ),
      }),
    });
  }
}
