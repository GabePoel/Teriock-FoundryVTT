import { AttributeModel, TradecraftModel } from "../data/models/modifier-models/_module.mjs";
import { BaseExpiration } from "../data/pseudo-documents/expirations/abstract/_module.mjs";

declare module "../executions/child-executions/armament-execution/armament-execution.mjs" {
  export default interface ArmamentExecution {
    get source(): TeriockItem<"body" | "equipment">;
  }
}

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
      rollOptions?: object;
      showDialog?: boolean;
      source?: AttributeModel | TeriockActiveEffect | TeriockItem | TradecraftModel;
    };

    /**
     * An event parsed into execution schema `data` and construction `options`, returned by `parseEvent` and merged
     * into the two bags by `use`.
     */
    export type ParsedEvent = { data: object, options: Partial<ExecutionOptions> };

    export type ThresholdExecutionOptions = ExecutionOptions & {
      bonus?: Teriock.System.FormulaString;
      threshold?: number;
    };

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

    export type AffinityExecutionOptions = ExecutionOptions & {
      /** The specific affinity being rolled, when the roll came from one. */
      affinity?: Affinity | null;
      type?: AffinityType;
      wrappers?: string[];
    };

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
      document: TeriockActiveEffect | TeriockItem | null | undefined;
      editable?: boolean;
      label?: string;
      openable?: boolean;
      selectHint?: string;
      selectTitle?: string;
      getChoices?: () => (TeriockActiveEffect | TeriockItem)[] | Promise<(TeriockActiveEffect | TeriockItem)[]>;
      update?: (document: TeriockActiveEffect | TeriockItem | null) => Promise<void> | void;
    };
  }
}

export {};
