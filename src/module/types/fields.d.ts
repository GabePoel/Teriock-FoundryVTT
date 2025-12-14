import { comparisons } from "../dice/functions/_module.mjs";
import { change } from "../constants/options/_module.mjs";
import { EvaluationModel } from "../data/models/_module.mjs";
import { TeriockEffect } from "../documents/_module.mjs";

declare global {
  namespace Teriock.Fields {
    export type _FormulaFieldOptions = {
      /** Is this formula deterministic? */
      deterministic?: boolean;
    };

    export type FormulaDerivationOptions = {
      floor?: boolean;
      ceil?: boolean;
      max?: number;
      min?: number;
      blank?: number | string;
      bool?: boolean;
      decimals?: number;
      skipRollData?: boolean;
    };

    export type _EvaluationFieldOptions = _FormulaFieldOptions &
      FormulaDerivationOptions & {
        model?: typeof EvaluationModel;
      };

    export type ChangeTime = keyof typeof change.time;

    export type ChangeTargets = keyof typeof change.targets;

    export type ConditionalChangeData = Teriock.Foundry.EffectChangeData & {
      condition: string | null;
      effect: TeriockEffect;
    };

    export type ExpandedChangeData = Teriock.Fields.ConditionalChangeData & {
      documentName: TeriockParentName | null;
      targets: Teriock.Fields.ChangeTargets;
      time: Teriock.Fields.ChangeTime;
      type: Teriock.Documents.CommonType | null;
    };

    export type ItemChangeTree = Record<
      Teriock.Documents.ItemType | "all",
      Teriock.Fields.ConditionalChangeData[]
    >;

    export type ActorChangeTree = Record<
      Teriock.Documents.ActorType | "all",
      Teriock.Fields.ConditionalChangeData[]
    >;

    export type EffectChangeTree = Record<
      Teriock.Documents.EffectType | "all",
      Teriock.Fields.ConditionalChangeData[]
    >;

    export type TypeChangeTree = {
      ActiveEffect: EffectChangeTree;
      Actor: ActorChangeTree;
      Item: ItemChangeTree;
    };

    export type ChangeTree = Record<ChangeTime, TypeChangeTree>;

    /**
     * Valid comparison operations.
     */
    export type ComparisonCheck = keyof typeof comparisons;

    /**
     * Valid change key comparison operations.
     */
    export type SpecialChangeCheck =
      | ComparisonCheck
      | "has"
      | "includes"
      | "exists"
      | "is"
      | "isNot";

    /**
     * Original special change keys are of the format: `![type]__[key]__[operation]__[value]__[originalKey]`
     */
    export type SpecialChange = Teriock.Foundry.EffectChangeData & {
      reference: {
        type: string;
        key: string;
        check: Teriock.Fields.SpecialChangeCheck;
        value: string;
      };
    };
  }
}

export {};
