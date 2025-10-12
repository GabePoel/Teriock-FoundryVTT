import CommandHandler from "../command-handler.mjs";

export class HackCommand extends CommandHandler {
  /** @inheritDoc */
  static COMMAND = "hack";

  /** @inheritDoc */
  async execute() {
    for (const actor of this.actors) {
      await actor.system.takeHack(this.terms[0]);
    }
  }
}

export class UnhackCommand extends CommandHandler {
  /** @inheritDoc */
  static COMMAND = "unhack";

  /** @inheritDoc */
  async execute() {
    for (const actor of this.actors) {
      await actor.system.takeUnhack(this.terms[0]);
    }
  }
}
