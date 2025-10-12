import CommandHandler from "../command-handler.mjs";

export class ResistCommand extends CommandHandler {
  /** @inheritDoc */
  static COMMAND = "resist";

  /** @inheritDoc */
  async execute() {
    for (const actor of this.actors) {
      await actor.system.rollResistance({
        advantage: this.advantage,
        disadvantage: this.disadvantage,
      });
    }
  }
}

export class ImmuneCommand extends CommandHandler {
  /** @inheritDoc */
  static COMMAND = "immune";

  /** @inheritDoc */
  async execute() {
    for (const actor of this.actors) {
      await actor.system.rollImmunity();
    }
  }
}
