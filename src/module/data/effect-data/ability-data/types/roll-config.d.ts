import type TeriockAbilityData from "../ability-data.mjs";
import type TeriockActor from "../../../../documents/actor.mjs";
import type TeriockBaseChatMessageSchema from "../../../message-data/base-message-data/_types";
import type TeriockRoll from "../../../../documents/roll.mjs";

export type AbilityUseData = {
  /** Actor using this ability. */
  actor: TeriockActor | null;
  /** Don't use this ability */
  dontUse: boolean;
  /** If this is proficient */
  proficient: boolean;
  /** If this is fluent */
  fluent: boolean;
  /** Options for the ability roll. */
  rollOptions: Teriock.RollOptions.AbilityRoll;
  /** Costs spent on this use of the ability */
  costs: {
    /** The total amount of HP spent on this ability. */
    hp: number;
    /** The total amount of MP spent on this ability. */
    mp: number;
    /** The total amount of GP spend on this ability. */
    gp: number;
  };
  /** Modifiers that change what the ability does. */
  modifiers: {
    /** The number of times this ability is heightened. */
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

export type AbilityChatData = {
  /** The HTML of the chat message. */
  content: string;
  /** Chat speaker data. */
  speaker: Teriock.Foundry.ChatSpeakerData;
  /** Rolls to pass into the chat message. */
  rolls: TeriockRoll[];
  /** Chat Message Data */
  system: Partial<TeriockBaseChatMessageSchema>;
};

export interface AbilityRollConfig {
  /** Data that describes this specific use of the ability. */
  useData: AbilityUseData;
  /** The data of the ability being rolled for. This should not be mutated. */
  abilityData: TeriockAbilityData;
  /** Data relevant for generating this ability's chat message. */
  chatData: AbilityChatData;
}
