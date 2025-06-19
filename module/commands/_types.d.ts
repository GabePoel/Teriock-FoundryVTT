import type { TeriockActor } from "../documents/_module.mjs";

/**
 * Options for configuring a command.
 *
 * @property aliases - Optional list of alternative names for the command.
 * @property category - Optional category to which the command belongs.
 * @property requiresTarget - Indicates if the command requires a target to operate.
 */
export type CommandOptions = {
  aliases?: string[];
  category?: string;
  requiresTarget?: boolean;
};

/**
 * Options for customizing chat-based commands or actions.
 *
 * @property advantage - Indicates if the action should be performed with advantage.
 * @property disadvantage - Indicates if the action should be performed with disadvantage.
 * @property twoHanded - Specifies if the action uses a two-handed mode.
 * @property rawArgs - An array of raw string arguments passed to the command.
 */
export type ChatOptions = {
  advantage?: boolean;
  disadvantage?: boolean;
  twoHanded?: boolean;
  rawArgs?: string[];
};

interface ExecuteContext {
  args: string[];
  chatData: object;
  actors: TeriockActor[];
}

interface CallbackContext {
  args: string[];
  options: object;
  chatData: object;
  actors: TeriockActor[];
}

type CommandCallback = (context: CallbackContext) => Promise<void>;

declare module "./command.mjs" {
  export default class TeriockCommand {
    id: string;
    docs: string;
    callback: CommandCallback;
    aliases: string[];
    category: string;
    requiresTarget: boolean;

    constructor(id: string, docs: string, callback: CommandCallback, options?: CommandOptions);

    execute(context: ExecuteContext): Promise<void>;
  }
}
