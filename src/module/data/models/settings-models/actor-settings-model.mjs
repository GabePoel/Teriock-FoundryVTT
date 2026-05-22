import { blockGaplessField, blockSizeField } from "../../fields/helpers/builders.mjs";
import EmbeddedDataModel from "../embedded-data-model.mjs";

const { fields } = foundry.data;

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
      sheet: new fields.SchemaField({
        blockAbilitiesGapless: new blockGaplessField({
          child: "TERIOCK.SHEETS.Actor.TABS.Abilities.title",
          initial: true,
        }),
        blockAbilitiesSize: new blockSizeField({
          child: "TERIOCK.SHEETS.Actor.TABS.Abilities.title",
          initial: "small",
        }),
        blockClassesGapless: new blockGaplessField({ child: "TERIOCK.SHEETS.Actor.TABS.Classes.title" }),
        blockClassesSize: new blockSizeField({ child: "TERIOCK.SHEETS.Actor.TABS.Classes.title" }),
        blockEffectsGapless: new blockGaplessField({ child: "TERIOCK.SHEETS.Actor.TABS.Effects.title", initial: true }),
        blockEffectsSize: new blockSizeField({ child: "TERIOCK.SHEETS.Actor.TABS.Effects.title", initial: "small" }),
        blockInventoryGapless: new blockGaplessField({
          child: "TERIOCK.SHEETS.Actor.TABS.Inventory.title",
          initial: true,
        }),
        blockInventorySize: new blockSizeField({
          child: "TERIOCK.SHEETS.Actor.TABS.Inventory.title",
          initial: "small",
        }),
        blockPowersGapless: new blockGaplessField({ child: "TERIOCK.SHEETS.Actor.TABS.Powers.title" }),
        blockPowersSize: new blockSizeField({ child: "TERIOCK.SHEETS.Actor.TABS.Powers.title" }),
        blockResourcesGapless: new blockGaplessField({ child: "TERIOCK.SHEETS.Actor.TABS.Resources.title" }),
        blockResourcesSize: new blockSizeField({ child: "TERIOCK.SHEETS.Actor.TABS.Resources.title" }),
        blockTradecraftsGapless: new blockGaplessField({ child: "TERIOCK.SHEETS.Actor.TABS.Tradecrafts.title" }),
        blockTradecraftsSize: new blockSizeField({ child: "TERIOCK.SHEETS.Actor.TABS.Tradecrafts.title" }),
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
