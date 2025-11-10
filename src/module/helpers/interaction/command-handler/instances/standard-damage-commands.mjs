import CommandHandler from "../command-handler.mjs";

export class StandardDamageCommand extends CommandHandler {
  /** @inheritDoc */
  static COMMAND = "standard";

  /** @inheritDoc */
  async execute() {
    for (const actor of this.actors) {
      await actor.system?.primaryAttacker.system.use({
        advantage: this.advantage || this.crit,
        disadvantage: this.disadvantage,
        secret: game.settings.get("teriock", "secretArmaments"),
      });
    }
  }
}
