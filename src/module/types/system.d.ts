import { displayOptions } from "../constants/options/display-options.mjs";
import { triggers } from "../constants/system/_module.mjs";
import { BaseAutomation } from "../data/pseudo-documents/automations/_module.mjs";
import type BaseExecution from "../executions/base-execution/base-execution.mjs";
import {
  AbilityExecution,
  ArmamentExecution,
} from "../executions/document-executions/_module.mjs";

declare global {
  export namespace Teriock.Parameters.Shared {
    export type CardDisplaySize = keyof typeof displayOptions.sizes;
  }

  export namespace Teriock.System {
    export type _CreateOperation = {
      /**
       * Allows subs that would be created by other documents to also be created as their own documents in the same
       * database call. May cause odd results.
       */
      allowDuplicateSubs?: boolean;
      /**
       * Since {@link HierarchyDocument._preCreateOperation} manipulates the default `keepId` value in creation
       * operations, subsequent operations using the same operation object can get messed up. This allows us to
       * reset it in {@link HierarchyDocument.createDocuments}.
       */
      cachedKeepId?: boolean;
      /** Tracker to see if the value of `cachedKeepId` should be read. */
      isKeepIdCached?: boolean;
      /** Force even subs to keep their `_id`. May cause `_id` collisions. */
      keepSubIds?: boolean;
    };

    export type ActivityTrigger = keyof typeof triggers.activity.choices;
    export type AttunableTrigger = keyof typeof triggers.attunable.choices;
    export type CombatTrigger = keyof typeof triggers.combat.choices;
    export type ConsequenceTrigger = keyof typeof triggers.consequence.choices;
    export type EquipmentTrigger = keyof typeof triggers.equipment.choices;
    export type ExecutionTrigger = keyof typeof triggers.execution.choices;
    export type ImpactTrigger = keyof typeof triggers.impact.choices;
    export type MountTrigger = keyof typeof triggers.mount.choices;
    export type ProtectionTrigger = keyof typeof triggers.protection.choices;
    export type TimeTrigger = keyof typeof triggers.time.choices;
    export type Trigger =
      | ActivityTrigger
      | AttunableTrigger
      | CombatTrigger
      | ConsequenceTrigger
      | EquipmentTrigger
      | ExecutionTrigger
      | ImpactTrigger
      | MountTrigger
      | ProtectionTrigger
      | TimeTrigger;

    export type TriggerScope = {
      ability?: TeriockAbility;
      actor?: GenericActor;
      amount?: number;
      armament?: TeriockArmament;
      attribute?: Teriock.Parameters.Actor.Attribute;
      automation?: BaseAutomation;
      effect?: GenericActiveEffect;
      equipment?: TeriockEquipment;
      execution?: BaseExecution | AbilityExecution | ArmamentExecution;
      item?: GenericItem;
      tradecraft?: Teriock.Parameters.Fluency.Tradecraft;
      trigger?: string;
    };

    /**
     * Something's competency level specifies if it's proficient or fluent.
     * - `0`: Neither proficient nor fluent
     * - `1`: Proficient
     * - `2`: Fluent
     */
    export type CompetenceLevel = 0 | 1 | 2;

    /**
     * Something's piercing level specifies if it's AV0 or UB.
     * - `0`: Neither AV0 nor UB
     * - `1`: AV0
     * - `2`: UB
     */
    export type PiercingLevel = 0 | 1 | 2;

    /**
     * Something's edge level specifies if it has advantage or disadvantage.
     * - `-1`: Disadvantage
     * - `0`: Neither advantage nor disadvantage
     * - `1`: Advantage
     */
    export type EdgeLevel = -1 | 0 | 1;

    /**
     * A string that can be used in a roll formula.
     */
    export type FormulaString = string;

    /**
     * A string that represents an image's file path.
     */
    export type ImageString = string;
  }
}
