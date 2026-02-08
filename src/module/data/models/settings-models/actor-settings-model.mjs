import {
  blockGaplessField,
  blockSizeField,
} from "../../fields/helpers/builders.mjs";
import EmbeddedDataModel from "../embedded-data-model.mjs";

const { fields } = foundry.data;

export default class ActorSettingsModel extends EmbeddedDataModel {
  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      autoWound: new fields.BooleanField({
        initial: true,
        label: "Auto Wound",
        hint: "Automatically apply down, critically wounded, and dead statuses?",
      }),
      sheetBlockAbilitiesGapless: new blockGaplessField({
        initial: true,
        label: "Abilities",
      }),
      sheetBlockAbilitiesSize: new blockSizeField({
        initial: "small",
        label: "Abilities",
      }),
      sheetBlockClassesGapless: new blockGaplessField({ label: "Classes" }),
      sheetBlockClassesSize: new blockSizeField({ label: "Classes" }),
      sheetBlockEffectsGapless: new blockGaplessField({
        initial: true,
        label: "Effects",
      }),
      sheetBlockEffectsSize: new blockSizeField({
        initial: "small",
        label: "Effects",
      }),
      sheetBlockInventoryGapless: new blockGaplessField({
        initial: true,
        label: "Inventory",
      }),
      sheetBlockInventorySize: new blockSizeField({
        initial: "small",
        label: "Inventory",
      }),
      sheetBlockPowersGapless: new blockGaplessField({ label: "Powers" }),
      sheetBlockPowersSize: new blockSizeField({ label: "Powers" }),
      sheetBlockResourcesGapless: new blockGaplessField({ label: "Resources" }),
      sheetBlockResourcesSize: new blockSizeField({ label: "Resources" }),
      sheetBlockTradecraftsGapless: new blockGaplessField({
        label: "Tradecrafts",
      }),
      sheetBlockTradecraftsSize: new blockSizeField({ label: "Tradecrafts" }),
    });
  }
}
