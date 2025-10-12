import { ROLL_TYPES } from "../../action-handler/instances/rollable-takes-handlers.mjs";
import CommandHandler from "../command-handler.mjs";

export class RollableTakesCommand extends CommandHandler {
  /** @inheritDoc */
  static COMMAND = "take";

  /** @inheritDoc */
  async execute() {
    for (const actor of this.actors) {
      const take = this.terms[0];
      const amount = Number(this.terms[1]);
      if (amount >= 0) {
        await ROLL_TYPES[take].callback(actor, amount);
      } else {
        await ROLL_TYPES[take].reverse(actor, Math.abs(amount));
      }
    }
  }
}
