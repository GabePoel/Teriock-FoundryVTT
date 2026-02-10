import ChildSettingsModel from "./child-settings-model.mjs";

const { fields } = foundry.data;

export default class AbilitySettingsModel extends ChildSettingsModel {
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      promptCostGp: new fields.BooleanField({
        hint: "Prompt user to spend variable GP upon use.",
        initial: true,
        label: "Prompt GP",
      }),
      promptCostHp: new fields.BooleanField({
        hint: "Prompt user to spend variable HP upon use.",
        initial: true,
        label: "Prompt HP",
      }),
      promptCostMp: new fields.BooleanField({
        hint: "Prompt user to spend variable MP upon use.",
        initial: true,
        label: "Prompt MP",
      }),
      promptHeighten: new fields.BooleanField({
        hint: "Prompt user to heighten upon use.",
        initial: true,
        label: "Prompt Heighten",
      }),
      promptTemplate: new fields.BooleanField({
        hint: "Prompt user to place a template upon use.",
        initial: true,
        label: "Prompt Template",
      }),
    });
  }
}
