import type { TeriockActor } from "../documents/_module.mjs";

/**
 * Options for customizing chat-based commands or actions.
 */
export type ChatOptions = {
  /** Is this roll made with advantage? */
  advantage: boolean;
  /** Is this roll made with disadvantage? */
  disadvantage: boolean;
  /** Should this deal two-handed damage? */
  twoHanded: boolean;
  /** Raw arguments. */
  rawArgs: string[];
};

/**
 * Context object passed to the execute method
 */
export type CommandExecuteContext = {
  /** Raw arguments from the chat message */
  args: string[];
  /** Original chat message data */
  chatData: object;
  /** Targeted actors */
  actors: TeriockActor[];
};

/**
 * Context object passed to command callbacks
 */
export type CommandCallbackContext = {
  /** Processed arguments (after removing option flags) */
  args: string[];
  /** Original chat message data */
  chatData: {
    /** The `_id` of the {@link TeriockUser} document who generated this message. */
    user: string;
    /** A `ChatSpeakerData` object which describes the origin of the {@link TeriockChatMessage} */
    speaker: Teriock.ChatSpeakerData;
  };
  /** Targeted actors */
  actors: TeriockActor[];
  /** Parsed roll/command options */
  options: ChatOptions;
};

/**
 * Function signature for command callbacks
 */
export type CommandCallback = (context: CommandCallbackContext) => Promise<void>;

/**
 * Options for creating a TeriockCommand
 */
export type CommandOptions = {
  /** Alternative names for the command */
  aliases?: string[];
  /** Category for organizing commands */
  category?: string;
  /** Whether the command requires at least one targeted token */
  requiresTarget?: boolean;
};
