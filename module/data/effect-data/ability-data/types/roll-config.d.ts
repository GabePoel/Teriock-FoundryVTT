import { CommonRollOptions } from "../../../../types/rolls";
import { ChatActionButton } from "../../../../types/chat";
import type TeriockAbilityData from "../ability-data.mjs";
import type { TeriockToken } from "../../../../documents/_module.mjs";
import TeriockRoll from "../../../../documents/roll.mjs";

export interface AbilityRollConfig {
  /** Data that describes this specific use of the ability. */
  useData: {
    /** Options for the ability roll. */
    rollOptions: CommonRollOptions;
    /** Costs spent on this use of the ability */
    costs: {
      /** Total amount of HP spent on this ability. */
      hp: number;
      /** Total amount of MP spent on this ability. */
      mp: number;
    };
    /** Modifiers that change what the ability does. */
    modifiers: {
      /** Number of times this ability is heightened. */
      heightened: number;
    };
    /** Formula used for this ability's dice roll. */
    formula: string;
    /** Data that can be referenced in the roll formula. */
    rollData: object;
    /** Targeted tokens. */
    targets: TeriockToken[];
  };
  /** The data of the ability being rolled for. This should not be mutated. */
  abilityData: TeriockAbilityData;
  /** Data relevant for generating this ability's chat message. */
  chatData: {
    /** The HTML of the chat message. */
    message: string;
    /** Buttons to render in the chat message. */
    buttons: ChatActionButton[];
    /** Chat speaker data. */
    speaker: ChatSpeakerData;
    /** Rolls to pass into the chat message. */
    rolls: TeriockRoll[];
  };
}
