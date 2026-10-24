import { DataModelConstructionContext } from "@common/abstract/_types.mjs";

import { AttributeModel, TradecraftModel } from "../data/models/modifier-models/_module.mjs";
import { BaseExpiration } from "../data/pseudo-documents/expirations/abstract/_module.mjs";

declare global {
  namespace Teriock.Execution {
    /**
     * Execution construction context.
     */
    export type ExecutionOptions = {
      actor?: TeriockActor;
      boosts?: Record<Teriock.Keys.Impact, Teriock.System.FormulaString>;
      competence?: Teriock.System.CompetenceLevel;
      event?: PointerEvent;
      messageMode?: Teriock.Messages.Mode;
      rollData?: object;
      showDialog?: boolean;
      source?:
        | AttributeModel
        | TeriockActiveEffect
        | TeriockCombatant
        | TeriockCombatantGroup
        | TeriockItem
        | TradecraftModel;
    };

    /**
     * An event parsed into execution schema `data` and construction `options`, returned by `parseEvent` and merged
     * into the two bags by `use`.
     */
    export type ParsedEvent = { data: object, options: Partial<ExecutionOptions> };

    export type ThresholdExecutionOptions = ExecutionOptions & {
      bonus?: Teriock.System.FormulaString;
      mobMembers?: TeriockCombatant[];
      threshold?: number;
    };

    export type InitiativeExecutionOptions = ThresholdExecutionOptions & { roller?: TeriockCombatant };

    export type AttackExecutionOptions = ExecutionOptions & ThresholdExecutionOptions & {
      armament?: TeriockItem<"body" | "equipment">;
      attackPenalty?: Teriock.System.FormulaString;
      limb?: boolean;
      piercing?: Teriock.System.PiercingLevel;
      sb?: boolean;
      useArmament?: boolean;
      vitals?: boolean;
      warded?: boolean;
    };

    export type ImpactsExecutionOptions = ExecutionOptions & { document?: TeriockActiveEffect | TeriockItem };

    export type AffinityExecutionOptions = ExecutionOptions & { type?: AffinityType, wrappers?: string[] };

    export type ResistanceExecutionOptions = AffinityExecutionOptions & ThresholdExecutionOptions;

    export type AbilityExecutionOptions = AttackExecutionOptions & {
      noGp?: boolean;
      noHeighten?: boolean;
      noHp?: boolean;
      noLp?: boolean;
      noMp?: boolean;
      source?: TeriockActiveEffect<"ability">;
    };

    export type ArmamentExecutionOptions = ExecutionOptions & {
      bonus?: Teriock.System.FormulaString;
      source?: TeriockItem<"body" | "equipment">;
    };

    export type EquipmentExecutionOptions = ArmamentExecutionOptions & { ammunition?: TeriockItem<"equipment"> };

    export type ConstructionOptions<Options = ExecutionOptions> = DataModelConstructionContext & Partial<Options>;

    export type ExpirationExecutionOptions = ThresholdExecutionOptions & { expiration?: BaseExpiration };

    export type ExecutionDialogButtonEntry = {
      action?: string;
      default?: boolean;
      icon?: string;
      label: string;
      name: string;
      callback?: () => void;
    };

    export type ExecutionDialogDocumentEntry = {
      /** Initial document to display. */
      document: TeriockDocument | null | undefined;
      /** Whether the selected document can be changed. */
      editable?: boolean;
      /** Label to display under the document. */
      label?: string;
      /** Choices that can't be toggled. */
      locked?: TeriockDocument[];
      /** Whether `update` receives an array of the `selected` documents. */
      multi?: boolean;
      /** Whether the documents in the document selector popup can be opened. */
      openable?: boolean;
      /** Entries display from highest to lowest priority. Defaults to 0. */
      priority?: number;
      /** Initially selected documents in the document selector popup. */
      selected?: TeriockDocument[];
      /** Hint for the document selector popup. */
      selectHint?: string;
      /** Title of the document selector popup. */
      selectTitle?: string;
      /** Documents that can be selected from. */
      getChoices?: () => Promise<TeriockDocument[]> | TeriockDocument[];
      /** Updates to apply after the selection is changed. */
      update?: (document: TeriockDocument | TeriockDocument[] | null) => Promise<void> | void;
    };
  }
}

export {};
