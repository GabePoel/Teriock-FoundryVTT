import TeriockAbilityModel from "../ability-model.mjs";
import TeriockActor from "../../../../documents/actor/actor.mjs";
import { TeriockBaseMessageModel } from "../../../message-data/_module.mjs";
import TeriockRoll from "../../../../dice/roll.mjs";
import { TeriockToken } from "../../../../canvas/placeables/_module.mjs";

export type AbilityUseData = {
  /** Actor using this ability */
  actor: TeriockActor | null;
  /** Costs spent on this use of the ability */
  costs: {
    /** The total amount of HP spent on this ability */
    hp: number;
    /** The total amount of MP spent on this ability */
    mp: number;
    /** The total amount of GP spend on this ability */
    gp: number;
  };
  /** Don't use this ability */
  dontUse: boolean;
  /** Executing token */
  executor?: TeriockToken;
  /** If this is fluent */
  fluent: boolean;
  /** Formula used for this ability's dice roll */
  formula: string;
  /** Modifiers that change what the ability does */
  modifiers: {
    /** The number of times this ability is heightened */
    heightened: number;
    /** Prevent this ability from being heightened */
    noHeighten: boolean;
    /** If this is warded */
    warded: boolean;
  };
  /** <schema> Don't place a template */
  noTemplate: boolean;
  /** If this is proficient */
  proficient: boolean;
  /** Data that can be referenced in the roll formula */
  rollData: object;
  /** Options for the ability roll */
  rollOptions: Teriock.RollOptions.AbilityRoll;
  /** Targeted tokens */
  targets: Set<TeriockToken>;
};

export type AbilityChatData = {
  /** The HTML of the chat message */
  content: string;
  /** Chat speaker data */
  speaker: Teriock.Foundry.ChatSpeakerData;
  /** Rolls to pass into the chat message */
  rolls: TeriockRoll[];
  /** Chat Message Data */
  system: TeriockBaseMessageModel;
};

export interface AbilityRollConfig {
  /** The data of the ability being rolled for. This should not be mutated */
  abilityData: TeriockAbilityModel;
  /** Data relevant for generating this ability's chat message */
  chatData: AbilityChatData;
  /** Data that describes this specific use of the ability */
  useData: AbilityUseData;
}
