import tc from "../constants/config/trigger-config.mjs";
import { BaseAutomation } from "../data/pseudo-documents/automations/abstract/_module.mjs";
import BaseExecution from "../executions/abstract/base-execution/base-execution.mjs";
import { AbilityExecution, ArmamentExecution } from "../executions/child-executions/_module.mjs";

declare global {
  export namespace Teriock.System {
    export type _Operation = {
      /** Forward this to a GM query which handles the operation instead of the local client. */
      asGM?: boolean;
      /** Notify the user if the operation failed. */
      notifyOnFailure?: boolean;
    };

    export type _CreateOperation = {
      /**
       * Allows subs that would be created by other documents to also be created as their own documents in the same
       * database call. May cause odd results.
       */
      allowDuplicateSubs?: boolean;
      /**
       * Since {@link HierarchyDocument._preCreateOperation} manipulates the default `keepId` value, subsequent
       * operations using the same options object can get messed up. This allows us to reset it in
       * {@link HierarchyDocument.createDocuments}.
       */
      cachedKeepId?: boolean;
      /** If true then subs will not be removed prior to document creation. */
      dontFilterSubs?: boolean;
      /** Skip rendering of sheets for documents with these IDs. */
      dontRenderSheets?: ID<TeriockDocument>[];
      /** Tracker to see if the value of `cachedKeepId` should be read. */
      isKeepIdCached?: boolean;
      /** Keep competence instead of inheriting from elder. */
      keepCompetence?: boolean;
      /** Force even subs to keep their `_id`. May cause `_id` collisions. */
      keepSubIds?: boolean;
    } & _Operation;

    export type ActivityTrigger = keyof typeof tc.activity.choices;
    export type AttunableTrigger = keyof typeof tc.attunable.choices;
    export type CombatTrigger = keyof typeof tc.combat.choices;
    export type ConsequenceTrigger = keyof typeof tc.consequence.choices;
    export type EquipmentTrigger = keyof typeof tc.equipment.choices;
    export type ExecutionTrigger = keyof typeof tc.execution.choices;
    export type ImpactTrigger = keyof typeof tc.impact.choices;
    export type MountTrigger = keyof typeof tc.mount.choices;
    export type ProtectionTrigger = keyof typeof tc.protection.choices;
    export type TimeTrigger = keyof typeof tc.time.choices;
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
      actor?: AnyActor;
      amount?: number;
      armament?: TeriockArmament;
      attribute?: Teriock.Keys.Attribute;
      automation?: BaseAutomation;
      awaitFire?: boolean;
      effect?: AnyActiveEffect;
      equipment?: TeriockEquipment;
      execution?: AbilityExecution | ArmamentExecution | BaseExecution;
      item?: AnyItem;
      tradecraft?: Teriock.Keys.Tradecraft;
      trigger?: string;
    };

    export type AttachmentData<T> = { data?: Partial<T>, uuid?: UUID<T> };

    export type Attachment<T> = AttachmentData<T> | UUID<T>;

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

    /**
     * A parsed identifier.
     */
    export type ResolvedIdentifier = { identifier: Identifier, type?: Teriock.Documents.CommonType };

    export type GlobalFetchOptions = { invalid?: boolean };

    export type SyncFetchOptions = GlobalFetchOptions & { strict?: boolean };

    export type FetchOptions = GlobalFetchOptions & {
      /** Whether to only fetch from the relative document's children. */
      relativeOnly?: boolean;
      /** An optional document to compare against. */
      relativeTo?: AnyCommonDocument;
    };

    /**
     * Options that control how multiple documents are resolved.
     */
    export type ResolveDocumentsOptions = {
      /** Whether to expand folders while resolving. */
      expandFolders?: boolean;
      /** Whether to expand tables while resolving. */
      expandTables?: boolean;
    };

    /**
     * Generic type corresponding to something that may or may not exist.
     */
    export type Existable<T> = Set<T> | T | T[] | null | undefined;

    /** Options on how to refresh documents. */
    export type RefreshOptions = {
      createChildren: boolean;
      deleteChildren: boolean;
      fullOverride: boolean;
      recursive: boolean;

      updateChildren: boolean;
      updateDocument: boolean;
    };

    type SerializablePrimitive = boolean | number | object | string | null;

    export type Serializable = SerializablePrimitive | SerializablePrimitive[];
  }
}
