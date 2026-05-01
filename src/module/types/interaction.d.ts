import { TeriockActor } from "../documents/_module.mjs";
import { impactConfig } from "../constants/config/impact-config.mjs";

declare global {
  namespace Teriock.Interaction {
    export type TakeKey = keyof typeof impactConfig;

    export type InteractionEntry = {
      icon: string | ((options: object) => string);
      label: string | ((options: object) => string);
      primary: (actor: TeriockActor, options?: object) => Promise<void>;
      secondary?: (actor: TeriockActor, options?: object) => Promise<void>;
      tooltip?: string | ((options: object) => string);
    };

    export type CommandEntry = InteractionEntry & {
      aliases?: string[];
      alt?: string;
      args?: string[];
      flags?: Record<string, string>;
      formula?: boolean;
      id: string;
      shift?: string;
    };

    export type UseOptions = {
      event?: PointerEvent;
    };

    /**
     * Options for generic threshold rolls.
     */
    export type ThresholdOptions = {
      /** Some bonus to add to the roll */
      bonus?: Teriock.System.FormulaString;
      /** The comparison operation `c(roll, threshold)` */
      comparison?: Teriock.Fields.ComparisonCheck;
      /** Proficiency and fluency */
      competence?: Teriock.System.CompetenceLevel;
      /** Positive for advantage, negative for disadvantage */
      edge?: Teriock.System.EdgeLevel;
      /** A formula to use other than the default one */
      formula?: Teriock.System.FormulaString;
      /** Whether to show a roll dialog */
      showDialog?: boolean;
      /** A threshold the roll needs to meet */
      threshold?: number;
    };

    export type TradecraftOptions = ThresholdOptions & {
      tradecraft?: Teriock.Keys.Tradecraft;
    };

    export type FeatOptions = ThresholdOptions & {
      attribute?: Teriock.Keys.Attribute;
    };

    export type HackOptions = {
      part?: Teriock.Keys.HackableBodyPart;
    };

    export type FormulaOptions = {
      formula?: string;
    };

    export type TakeOptions = FormulaOptions & {
      apply?: boolean;
      boost?: boolean;
      crit?: boolean;
      impact?: Teriock.Keys.Impact;
      reverse?: boolean;
      boosts?: number;
    };

    export type StatusOptions = {
      status?: Teriock.Keys.Condition;
    };

    export type StandardDamageOptions = {
      armament?: UUID<TeriockArmament>;
      crit?: boolean;
      twoHanded?: boolean;
    };

    export type ResistOptions = ThresholdOptions & {
      hex?: boolean;
    };

    export type DocumentUseOptions = ThresholdOptions &
      Teriock.Execution.DocumentExecutionOptions & {
        competence?: number;
        noHeighten?: boolean;
      };

    export type UseLocalOptions = DocumentUseOptions & {
      lookup?: string;
      type?: Teriock.Documents.ChildType;
    };

    export type UseExternalOptions = DocumentUseOptions &
      Teriock.System.ResolveDocumentsOptions & {
        uuid?: UUID<ChildDocument>;
      };

    export type ButtonCustomization = {
      icon?: string;
      label?: string;
    };
  }
}

export {};
