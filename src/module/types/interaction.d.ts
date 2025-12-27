import { TeriockActor } from "../documents/_module.mjs";
import { take } from "../constants/options/_module.mjs";

declare global {
  namespace Teriock.Interactions {
    export type TakeKey = keyof typeof take;

    export type InteractionEntry = {
      icon: string | ((options: object) => string);
      label: string | ((options: object) => string);
      primary: (actor: TeriockActor, options?: object) => Promise<void>;
      secondary?: (actor: TeriockActor, options?: object) => Promise<void>;
      tooltip?: string | ((options: object) => string);
    };

    export type CommandEntry = InteractionEntry & {
      id: string;
      aliases?: string[];
      args?: string[];
      flags?: Record<string, string>;
      formula?: boolean;
    };

    export type ThresholdOptions = {
      advantage?: boolean;
      disadvantage?: boolean;
      bonus?: string | number;
      threshold?: number;
    };

    export type TradecraftOptions = ThresholdOptions & {
      tradecraft?: Teriock.Parameters.Fluency.Tradecraft;
    };

    export type FeatOptions = ThresholdOptions & {
      attribute?: Teriock.Parameters.Actor.Attribute;
    };

    export type HackOptions = {
      part?: Teriock.Parameters.Actor.HackableBodyPart;
    };

    export type FormulaOptions = {
      formula?: string;
    };

    export type TakeOptions = FormulaOptions & {
      type?: TakeKey;
      crit?: boolean;
      boost?: boolean;
      apply?: boolean;
      reverse?: boolean;
    };

    export type StatusOptions = {
      status?: Teriock.Parameters.Condition.ConditionKey;
    };

    export type StandardDamageOptions = {
      attacker?: string;
      crit?: boolean;
      twoHanded?: boolean;
    };

    export type ResistOptions = ThresholdOptions & {
      hex?: boolean;
    };

    export type UseAbilityOptions = ThresholdOptions & {
      ability?: string;
    };
  }
}

export {};
