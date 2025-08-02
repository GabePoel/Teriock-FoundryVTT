import { CommonRollOptions } from "../../../../types/rolls";
import type TeriockAbilityData from "../ability-data.mjs";
import type TeriockActor from "../../../../documents/actor.mjs";
import type TeriockBaseChatMessageSchema from "../../../message-data/base-message-data/_types";
import type TeriockRoll from "../../../../documents/roll.mjs";

export type AbilityUseData = {
  /** Actor using this ability. */
  actor: TeriockActor;
  /** Options for the ability roll. */
  rollOptions: CommonRollOptions;
  /** Costs spent on this use of the ability */
  costs: {
    /** Total amount of HP spent on this ability. */
    hp: number;
    /** Total amount of MP spent on this ability. */
    mp: number;
    /** Total amount of GP spend on this ability. */
    gp: number;
  };
  /** Modifiers that change what the ability does. */
  modifiers: {
    /** Number of times this ability is heightened. */
    heightened: number;
    /** Prevent this ability from being heightened. */
    noHeighten: boolean;
  };
  /** Formula used for this ability's dice roll. */
  formula: string;
  /** Data that can be referenced in the roll formula. */
  rollData: object;
  /** Targeted tokens. */
  targets: Set<any>;
};

export interface AbilityRollConfig {
  /** Data that describes this specific use of the ability. */
  useData: AbilityUseData;
  /** The data of the ability being rolled for. This should not be mutated. */
  abilityData: TeriockAbilityData;
  /** Data relevant for generating this ability's chat message. */
  chatData: {
    /** The HTML of the chat message. */
    content: string;
    /** Chat speaker data. */
    speaker: Teriock.ChatSpeakerData;
    /** Rolls to pass into the chat message. */
    rolls: TeriockRoll[];
    /** Chat Message Data */
    system: TeriockBaseChatMessageSchema;
  };
}
