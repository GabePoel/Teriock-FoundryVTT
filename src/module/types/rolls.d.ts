import type { dieOptions } from "../constants/options/die-options.mjs";
import type { TeriockToken } from "../canvas/placeables/_module.mjs";
import type { TeriockActor } from "../documents/_module.mjs";
import type { AbilityChatData, AbilityUseData } from "../data/effect-data/ability-data/types/roll-config";
import type TeriockAbilityData from "../data/effect-data/ability-data/ability-data.mjs";

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
    };

    export type AbilityRoll = Teriock.RollOptions.CommonRoll & {
      /** Turn off heightening */
      noHeighten?: boolean;
      /** Forced {@link TeriockActor} */
      actor?: TeriockActor;
      /** Force proficiency on/off */
      proficient?: boolean;
      /** Force fluency on/off */
      fluent?: boolean;
    };

    /**
     * Options for performing an equipment roll.
     */
    export type EquipmentRoll = {
      /** Should this deal two-handed damage? */
      twoHanded?: boolean;
      /** Bonus damage that should be added */
      bonusDamage?: string;
      /** Should this hide information about the equipment? */
      secret?: boolean;
      /** Should this be a crit? */
      advantage?: boolean;
      /** Override the default roll formula */
      formula?: string;
      /** Go critical? */
      crit?: boolean;
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
      speaker?: Teriock.Foundry.ChatSpeakerData;
      actor?: TeriockActor;
      token?: TeriockToken;
      event?: Event;
      data?: Teriock.HookData.BaseHookData;
      useData?: AbilityUseData;
      abilityData?: TeriockAbilityData;
      chatData?: AbilityChatData;
    };
  }
}
