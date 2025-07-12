import type { TeriockActor } from "../documents/_module.mjs";

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
