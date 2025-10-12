import CommandHandler from "../command-handler.mjs";

export class FeatSaveCommand extends CommandHandler {
  /** @inheritDoc */
  static COMMAND = "save";

  /** @inheritDoc */
  async execute() {
    for (const actor of this.actors) {
      await actor.system.rollFeatSave(this.terms[0], {
        advantage: this.advantage,
        disadvantage: this.disadvantage,
      });
    }
  }
}
