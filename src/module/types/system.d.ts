import tc from "../constants/config/trigger-config.mjs";
import { BaseAutomation } from "../data/pseudo-documents/automations/abstract/_module.mjs";
import BaseExecution from "../executions/abstract/base-execution/base-execution.mjs";
import { AbilityExecution, ArmamentExecution } from "../executions/child-executions/_module.mjs";

declare global {
  export namespace Teriock.System {
    export type _Operation = {
      /** Forward this to a GM query which handles the operation instead of the local client. */
      asGM?: boolean;
      /** The operation can prompt the user with interactive dialogs. */
      interactive?: boolean;
      /** Notify the user if the operation failed. */
      notifyOnFailure?: boolean;
      /** Don't track this in registries. */
      noTrack?: boolean;
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
      /** Skip rendering of sheets for documents with these IDs. */
      dontRenderSheets?: ID<TeriockDocument>[];
      /** Keep competence instead of inheriting from elder. */
      keepCompetence?: boolean;
      /** Whether subs keep their `_id`. Defaults to `keepId`, and only applies when `keepId` is set. */
      keepSubIds?: boolean;
      /** UUIDs of known subs to filter out. */
      knownSubs?: Set<UUID>;
    } & _Operation;

    export type ActivityTrigger = keyof typeof tc.activity.choices;
    export type AttunableTrigger = keyof typeof tc.attunable.choices;
    export type CombatTrigger = keyof typeof tc.combat.choices;
    export type ConsequenceTrigger = keyof typeof tc.consequence.choices;
    export type EquipmentTrigger = keyof typeof tc.equipment.choices;
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
      | ImpactTrigger
      | MountTrigger
      | ProtectionTrigger
      | TimeTrigger;

    export type TriggerScope = {
      /** Set by ability executions. */
      ability?: TeriockActiveEffect<"ability">;
      /** The execution's actor or the source's actor. */
      actor?: TeriockActor;
      /** The amount of an impact or hack or payment. */
      amount?: number;
      /** Set by attack and armament executions. */
      armament?: TeriockItem<"body" | "equipment">;
      /** The attribute of a feat save. */
      attribute?: Teriock.Keys.Attribute;
      /** The automation a macro is executed from. */
      automation?: BaseAutomation;
      /** Triggered message data collected during dispatch keyed by source. */
      chatDataBySource?: Record<string, Partial<Teriock.Data.ChatMessageData>>;
      /** The source or its nearest ancestor effect. */
      effect?: TeriockActiveEffect;
      /** The execution that fired the trigger. */
      execution?: AbilityExecution | ArmamentExecution | BaseExecution;
      /** The source or its nearest ancestor item. */
      item?: TeriockItem;
      /** The mode of a payment. */
      mode?: Teriock.Keys.PayMode;
      /** The body part of a hack or unhack. */
      part?: Teriock.Keys.HackableBodyPart;
      /** The document the trigger originated from. */
      source?: TeriockActiveEffect | TeriockActor | TeriockItem;
      /** The tradecraft of a tradecraft roll. */
      tradecraft?: Teriock.Keys.Tradecraft;
      /** The trigger that was fired. */
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
      relativeTo?: TeriockActiveEffect | TeriockActor | TeriockItem;
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
