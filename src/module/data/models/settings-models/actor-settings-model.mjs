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
        hint: game.i18n.localize(
          "TERIOCK.MODELS.ActorSettings.automaticallyWound.hint",
        ),
        initial: true,
        label: game.i18n.localize(
          "TERIOCK.MODELS.ActorSettings.automaticallyWound.label",
        ),
      }),
      automaticallyPayAbilityCosts: new fields.BooleanField({
        hint: game.i18n.localize(
          "TERIOCK.SETTINGS.automaticallyPayAbilityCosts.hint",
        ),
        initial: true,
        label: game.i18n.localize(
          "TERIOCK.SETTINGS.automaticallyPayAbilityCosts.name",
        ),
      }),
      nonHierarchicalChanges: new fields.BooleanField({
        hint: game.i18n.localize(
          "TERIOCK.SETTINGS.nonHierarchicalChanges.hint",
        ),
        initial: true,
        label: game.i18n.localize(
          "TERIOCK.SETTINGS.nonHierarchicalChanges.name",
        ),
      }),
      sheetBlockAbilitiesGapless: new blockGaplessField({
        initial: true,
        label: game.i18n.localize(
          "TERIOCK.MODELS.ActorSettings.sheetBlockAbilitiesGapless.label",
        ),
      }),
      sheetBlockAbilitiesSize: new blockSizeField({
        initial: "small",
        label: game.i18n.localize(
          "TERIOCK.MODELS.ActorSettings.sheetBlockAbilitiesSize.label",
        ),
      }),
      sheetBlockClassesGapless: new blockGaplessField({
        label: game.i18n.localize(
          "TERIOCK.MODELS.ActorSettings.sheetBlockClassesGapless.label",
        ),
      }),
      sheetBlockClassesSize: new blockSizeField({
        label: game.i18n.localize(
          "TERIOCK.MODELS.ActorSettings.sheetBlockClassesSize.label",
        ),
      }),
      sheetBlockEffectsGapless: new blockGaplessField({
        initial: true,
        label: game.i18n.localize(
          "TERIOCK.MODELS.ActorSettings.sheetBlockEffectsGapless.label",
        ),
      }),
      sheetBlockEffectsSize: new blockSizeField({
        initial: "small",
        label: game.i18n.localize(
          "TERIOCK.MODELS.ActorSettings.sheetBlockEffectsSize.label",
        ),
      }),
      sheetBlockInventoryGapless: new blockGaplessField({
        initial: true,
        label: game.i18n.localize(
          "TERIOCK.MODELS.ActorSettings.sheetBlockInventoryGapless.label",
        ),
      }),
      sheetBlockInventorySize: new blockSizeField({
        initial: "small",
        label: game.i18n.localize(
          "TERIOCK.MODELS.ActorSettings.sheetBlockInventorySize.label",
        ),
      }),
      sheetBlockPowersGapless: new blockGaplessField({
        label: game.i18n.localize(
          "TERIOCK.MODELS.ActorSettings.sheetBlockPowersGapless.label",
        ),
      }),
      sheetBlockPowersSize: new blockSizeField({
        label: game.i18n.localize(
          "TERIOCK.MODELS.ActorSettings.sheetBlockPowersSize.label",
        ),
      }),
      sheetBlockResourcesGapless: new blockGaplessField({
        label: game.i18n.localize(
          "TERIOCK.MODELS.ActorSettings.sheetBlockResourcesGapless.label",
        ),
      }),
      sheetBlockResourcesSize: new blockSizeField({
        label: game.i18n.localize(
          "TERIOCK.MODELS.ActorSettings.sheetBlockResourcesSize.label",
        ),
      }),
      sheetBlockTradecraftsGapless: new blockGaplessField({
        label: game.i18n.localize(
          "TERIOCK.MODELS.ActorSettings.sheetBlockTradecraftsGapless.label",
        ),
      }),
      sheetBlockTradecraftsSize: new blockSizeField({
        label: game.i18n.localize(
          "TERIOCK.MODELS.ActorSettings.sheetBlockTradecraftsSize.label",
        ),
      }),
    });
  }
}
