import type { TeriockActor } from "../../documents/_module.mjs";

declare global {
  namespace Teriock.Command {
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
    export type ExecuteContext = {
      /** Raw arguments from the chat message */
      args: string[];
      /** Original chat message data */
      chatData: Object;
      /** Targeted actorsUuids */
      actors: TeriockActor[];
    };

    /**
     * Context object passed to command callbacks
     */
    export type CallbackContext = {
      /** Processed arguments (after removing option flags) */
      args: string[];
      /** Original chat message data */
      chatData: {
        /** The `_id` of the {@link TeriockUser} document who generated this message. */
        user: string;
        /** A `ChatSpeakerData` object which describes the origin of the {@link TeriockChatMessage} */
        speaker: Teriock.Foundry.ChatSpeakerData;
      };
      /** Targeted actorsUuids */
      actors: TeriockActor[];
      /** Parsed roll/command options */
      options: Teriock.Command.ChatOptions;
    };

    /**
     * Function signature for command callbacks
     */
    export type Callback = (
      context: Teriock.Command.CallbackContext,
    ) => Promise<void>;

    /**
     * Valid command categories.
     */
    export type Category = "#combat" | "#damage" | "#support" | "utility";

    /**
     * Options for creating a TeriockCommand
     */
    export type Options = {
      /** Alternative names for the command */
      aliases?: string[];
      /** Category for organizing commands */
      category?: Teriock.Command.Category;
      /** Whether the command requires at least one targeted token */
      requiresTarget?: boolean;
    };
  }
}

declare module "./command.mjs" {
  export default interface TeriockCommand {
    id: string;
    docs: string;
    callback: Teriock.Command.Callback;
    aliases: string[];
    category: string;
    requiresTarget: boolean;
  }
}
