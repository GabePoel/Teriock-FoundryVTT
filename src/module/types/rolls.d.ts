import { dieOptions } from "../constants/options/die-options.mjs";
import { TeriockToken } from "../canvas/placeables/_module.mjs";
import { TeriockActor } from "../documents/_module.mjs";
import {
  AbilityChatData,
  AbilityUseData,
} from "../data/effect-data/ability-model/types/roll-config";
import TeriockAbilityModel from "../data/effect-data/ability-model/ability-model.mjs";

declare global {
  namespace Teriock.RollOptions {
    /**
     * Options for performing a d20 roll.
     */
    export type CommonRoll = {
      /** Is this roll made with advantage? */
      advantage?: boolean;
      /** Is this roll made with disadvantage? */
      disadvantage?: boolean;
      /** Chat Message HTML */
      message?: string;
      /** Success Threshold */
      threshold?: number;
      /** Chat message panels */
      panels?: Teriock.MessageData.MessagePanel[];
    };

    export type AbilityRoll = Teriock.RollOptions.CommonRoll & {
      /** Forced {@link TeriockActor} */
      actor?: TeriockActor;
      /** Force fluency on/off */
      fluent?: boolean;
      /** Turn off heightening */
      noHeighten?: boolean;
      /** Force proficiency on/off */
      proficient?: boolean;
    };

    /**
     * Options for performing an equipment roll.
     */
    export type EquipmentRoll = {
      /** Should this be a crit? */
      advantage?: boolean;
      /** Bonus damage that should be added */
      bonusDamage?: string;
      /** Go critical? */
      crit?: boolean;
      /** Override the default roll formula */
      formula?: string;
      /** Should this hide information about the equipment? */
      secret?: boolean;
      /** Should this deal two-handed damage? */
      twoHanded?: boolean;
    };

    /**
     * Options for modifying the behavior of a roll that can crit.
     */
    export type CritRoll = {
      /** Go critical? */
      crit?: boolean;
    };

    /**
     * Allowable number of dice faces.
     */
    export type PolyhedralDieFaces = keyof typeof dieOptions.faces;

    /**
     * Allowable dice values.
     */
    export type PolyhedralDie = `d${PolyhedralDieFaces}`;

    export type MacroScope = {
      abilityData?: TeriockAbilityModel;
      actor?: TeriockActor;
      chatData?: AbilityChatData;
      data?: Teriock.HookData.BaseHookData;
      event?: Event;
      speaker?: Teriock.Foundry.ChatSpeakerData;
      token?: TeriockToken;
      useData?: AbilityUseData;
      document?: TeriockChild;
    };

    export type BagComposition = {
      color: string;
      count: number;
      originalTerm: string;
    };

    export type PendingPullData = {
      after: string;
      bagFormula: string;
      before: string;
      pullCountExpr: string;
    };
  }
}
