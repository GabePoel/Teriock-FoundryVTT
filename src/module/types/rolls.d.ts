import { dieOptions } from "../constants/options/die-options.mjs";
import { TeriockToken } from "../canvas/placeables/_module.mjs";
import { TeriockActor } from "../documents/_module.mjs";

declare global {
  namespace Teriock.RollOptions {
    // noinspection SpellCheckingInspection
    export type RollMode =
      | "roll"
      | "publicroll"
      | "gmroll"
      | "blindroll"
      | "selfroll";
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
      actor?: TeriockActor;
      data?: Teriock.HookData.BaseHookData;
      event?: Event;
      speaker?: Teriock.Foundry.ChatSpeakerData;
      token?: TeriockToken;
      document?: TeriockChild;
    };
  }
}
