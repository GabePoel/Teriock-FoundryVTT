// @ts-ignore

declare module "./command.mjs" {
  export default class TeriockCommand {
    id: string;
    docs: string;
    callback: Teriock.CommandCallback;
    aliases: string[];
    category: string;
    requiresTarget: boolean;

    constructor(id: string, docs: string, callback: Teriock.CommandCallback, options?: Teriock.CommandOptions);

    execute(context: Teriock.CommandExecuteContext): Promise<void>;
  }
}
