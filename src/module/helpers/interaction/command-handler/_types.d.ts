import InteractionHandler from "../interaction-handler.mjs";

declare module "./command-handler.mjs" {
  export default interface CommandHandler extends InteractionHandler {
    execute(): Promise<void>;
  }
}
