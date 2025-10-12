import { harmRoll } from "../../../quick-rolls.mjs";
import CommandHandler from "../command-handler.mjs";

export class HarmCommand extends CommandHandler {
  /** @inheritDoc */
  static COMMAND = "harm";

  /** @inheritDoc */
  async execute() {
    for (const actor of this.actors) {
      await harmRoll(this.expression, actor.getRollData());
    }
  }
}
