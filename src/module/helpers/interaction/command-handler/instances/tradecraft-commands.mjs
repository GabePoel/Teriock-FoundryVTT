import CommandHandler from "../command-handler.mjs";

export class TradecraftCommand extends CommandHandler {
  /** @inheritDoc */
  static COMMAND = "tc";

  /** @inheritDoc */
  async execute() {
    for (const actor of this.actors) {
      await actor.system.rollTradecraft(this.terms[0], {
        advantage: this.advantage,
        disadvantage: this.disadvantage,
      });
    }
  }
}
