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
      automaticallyWound: new fields.BooleanField({
        hint: _loc("TERIOCK.MODELS.ActorSettings.automaticallyWound.hint"),
        initial: true,
        label: _loc("TERIOCK.MODELS.ActorSettings.automaticallyWound.label"),
      }),
      automaticallyPayAbilityCosts: new fields.BooleanField({
        hint: _loc("TERIOCK.SETTINGS.automaticallyPayAbilityCosts.hint"),
        initial: true,
        label: _loc("TERIOCK.SETTINGS.automaticallyPayAbilityCosts.name"),
      }),
      nonHierarchicalChanges: new fields.BooleanField({
        hint: _loc("TERIOCK.SETTINGS.nonHierarchicalChanges.hint"),
        initial: true,
        label: _loc("TERIOCK.SETTINGS.nonHierarchicalChanges.name"),
      }),
      sheetBlockAbilitiesGapless: new blockGaplessField({
        initial: true,
        label: _loc(
          "TERIOCK.MODELS.ActorSettings.sheetBlockAbilitiesGapless.label",
        ),
      }),
      sheetBlockAbilitiesSize: new blockSizeField({
        initial: "small",
        label: _loc(
          "TERIOCK.MODELS.ActorSettings.sheetBlockAbilitiesSize.label",
        ),
      }),
      sheetBlockClassesGapless: new blockGaplessField({
        label: _loc(
          "TERIOCK.MODELS.ActorSettings.sheetBlockClassesGapless.label",
        ),
      }),
      sheetBlockClassesSize: new blockSizeField({
        label: _loc("TERIOCK.MODELS.ActorSettings.sheetBlockClassesSize.label"),
      }),
      sheetBlockEffectsGapless: new blockGaplessField({
        initial: true,
        label: _loc(
          "TERIOCK.MODELS.ActorSettings.sheetBlockEffectsGapless.label",
        ),
      }),
      sheetBlockEffectsSize: new blockSizeField({
        initial: "small",
        label: _loc("TERIOCK.MODELS.ActorSettings.sheetBlockEffectsSize.label"),
      }),
      sheetBlockInventoryGapless: new blockGaplessField({
        initial: true,
        label: _loc(
          "TERIOCK.MODELS.ActorSettings.sheetBlockInventoryGapless.label",
        ),
      }),
      sheetBlockInventorySize: new blockSizeField({
        initial: "small",
        label: _loc(
          "TERIOCK.MODELS.ActorSettings.sheetBlockInventorySize.label",
        ),
      }),
      sheetBlockPowersGapless: new blockGaplessField({
        label: _loc(
          "TERIOCK.MODELS.ActorSettings.sheetBlockPowersGapless.label",
        ),
      }),
      sheetBlockPowersSize: new blockSizeField({
        label: _loc("TERIOCK.MODELS.ActorSettings.sheetBlockPowersSize.label"),
      }),
      sheetBlockResourcesGapless: new blockGaplessField({
        label: _loc(
          "TERIOCK.MODELS.ActorSettings.sheetBlockResourcesGapless.label",
        ),
      }),
      sheetBlockResourcesSize: new blockSizeField({
        label: _loc(
          "TERIOCK.MODELS.ActorSettings.sheetBlockResourcesSize.label",
        ),
      }),
      sheetBlockTradecraftsGapless: new blockGaplessField({
        label: _loc(
          "TERIOCK.MODELS.ActorSettings.sheetBlockTradecraftsGapless.label",
        ),
      }),
      sheetBlockTradecraftsSize: new blockSizeField({
        label: _loc(
          "TERIOCK.MODELS.ActorSettings.sheetBlockTradecraftsSize.label",
        ),
      }),
    });
  }
}
