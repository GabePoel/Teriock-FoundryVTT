import CommandHandler from "../command-handler.mjs";

export class DeathBagCommand extends CommandHandler {
  /** @inheritDoc */
  static COMMAND = "bag";

  /** @inheritDoc */
  async execute() {
    for (const actor of this.actors) {
      await actor.system.deathBagPull();
    }
  }
}
