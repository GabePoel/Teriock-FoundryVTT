import characterConfig from "../../../constants/config/character-config.mjs";
import { BaseActorSystem } from "../../systems/actors/_module.mjs";
import { AbilitySystem, BaseEffectSystem } from "../../systems/effects/_module.mjs";
import { BaseItemSystem } from "../../systems/items/_module.mjs";

declare global {
  namespace Teriock.Models {
    type TabNames = typeof characterConfig.tabs[number]["key"];

    export type ActorSettingsSheetData =
      & {
        /** <schema> Whether these blocks render without gaps */
        [K in TabNames as `block${K}Gapless`]: boolean;
      }
      & {
        /** <schema> Display size for these blocks */
        [K in TabNames as `block${K}Size`]: Teriock.Keys.CardDisplaySize;
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

    export type ChildSettingsModelData = { get parent(): BaseEffectSystem | BaseItemSystem };

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

      get parent(): AbilitySystem;
    };
  }
}

export {};
