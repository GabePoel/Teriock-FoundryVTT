import { BaseActorSystem } from "../../systems/actors/_module.mjs";
import { AbilitySystem } from "../../systems/effects/_module.mjs";
import { BaseEffectSystem } from "../../systems/effects/_module.mjs";
import { BaseItemSystem } from "../../systems/items/_module.mjs";

declare global {
  namespace Teriock.Models {
    export type CommonSettingsSheetData = {
      /** <schema> Whether child blocks render without gaps */
      blockChildGapless: boolean;
      /** <schema> Display size for child blocks */
      blockChildSize: Teriock.Keys.CardDisplaySize;
    };

    export type ActorSettingsSheetData = {
      /** <schema> Whether ability blocks render without gaps */
      blockAbilitiesGapless: boolean;
      /** <schema> Display size for ability blocks */
      blockAbilitiesSize: Teriock.Keys.CardDisplaySize;
      /** <schema> Whether class blocks render without gaps */
      blockClassesGapless: boolean;
      /** <schema> Display size for class blocks */
      blockClassesSize: Teriock.Keys.CardDisplaySize;
      /** <schema> Whether effect blocks render without gaps */
      blockEffectsGapless: boolean;
      /** <schema> Display size for effect blocks */
      blockEffectsSize: Teriock.Keys.CardDisplaySize;
      /** <schema> Whether inventory blocks render without gaps */
      blockInventoryGapless: boolean;
      /** <schema> Display size for inventory blocks */
      blockInventorySize: Teriock.Keys.CardDisplaySize;
      /** <schema> Whether power blocks render without gaps */
      blockPowersGapless: boolean;
      /** <schema> Display size for power blocks */
      blockPowersSize: Teriock.Keys.CardDisplaySize;
      /** <schema> Whether resource blocks render without gaps */
      blockResourcesGapless: boolean;
      /** <schema> Display size for resource blocks */
      blockResourcesSize: Teriock.Keys.CardDisplaySize;
      /** <schema> Whether tradecraft blocks render without gaps */
      blockTradecraftsGapless: boolean;
      /** <schema> Display size for tradecraft blocks */
      blockTradecraftsSize: Teriock.Keys.CardDisplaySize;
    };

    export type ActorSettingsAutomationData = {
      /** <schema> Whether non-hierarchical changes apply to children */
      nonHierarchicalChanges: boolean;
      /** <schema> Whether ability costs are paid automatically */
      payAbilityCosts: boolean;
      /** <schema> Whether wound statuses are applied automatically */
      wound: boolean;
    };

    export type ActorSettingsTokenData = {
      /** <schema> Whether token coloration is synced from actor status */
      autoColoration: boolean;
      /** <schema> Whether detection modes are synced from actor senses */
      autoDetectionModes: boolean;
      /** <schema> Whether lighting is synced from actor status */
      autoLighting: boolean;
      /** <schema> Whether token magic filters are applied automatically */
      autoMagic: boolean;
      /** <schema> Whether token scale is synced from actor size */
      autoScale: boolean;
      /** <schema> Whether token art is synced from transformations */
      autoTransformation: boolean;
      /** <schema> Whether vision angle is synced from actor senses */
      autoVisionAngle: boolean;
      /** <schema> Whether vision mode is synced from actor senses and status */
      autoVisionModes: boolean;
      /** <schema> Whether vision range is synced from actor senses */
      autoVisionRange: boolean;
    };

    export type ChildSettingsModelData = {
      /** <schema> Sheet display settings */
      sheet: CommonSettingsSheetData;

      get parent(): BaseEffectSystem | BaseItemSystem;
    };

    export type ActorSettingsModelData = {
      /** <schema> Automation behavior settings */
      automation: ActorSettingsAutomationData;
      /** <schema> Sheet display settings */
      sheet: ActorSettingsSheetData;
      /** <schema> Token sync settings */
      token: ActorSettingsTokenData;

      get parent(): BaseActorSystem;
    };

    export type AbilitySettingsExecutionData = {
      /** <schema> Whether GP costs should prompt during execution */
      promptCostGp: boolean;
      /** <schema> Whether HP costs should prompt during execution */
      promptCostHp: boolean;
      /** <schema> Whether LP costs should prompt during execution */
      promptCostLp: boolean;
      /** <schema> Whether MP costs should prompt during execution */
      promptCostMp: boolean;
      /** <schema> Whether heightening should prompt during execution */
      promptHeighten: boolean;
      /** <schema> Whether template placement should prompt during execution */
      promptTemplate: boolean;
    };

    export type AbilitySettingsModelData = {
      /** <schema> Execution prompt settings */
      execution: AbilitySettingsExecutionData;
      /** <schema> Sheet display settings */
      sheet: CommonSettingsSheetData;

      get parent(): AbilitySystem;
    };
  }
}

export {};
