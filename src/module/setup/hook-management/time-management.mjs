import { timeOptions } from "../../constants/options/time-options.mjs";
import { ucFirst } from "../../helpers/string.mjs";
import { massUpdate } from "../../helpers/utils.mjs";

export default function registerTimeManagementHooks() {
  foundry.helpers.Hooks.on(
    "updateWorldTime",
    (_worldTime, dt, _options, userId) => {
      if (game.user.id === userId && game.user.isActiveGM) {
        const updateData = [];
        for (const actor of game.actors.relevant) {
          // Increase debt
          if (actor.system.money.debt > 0 && actor.system.interestRate > 0) {
            const daysElapsed = dt / 86400;
            const newDebt =
              actor.system.money.debt *
              Math.pow(1 + actor.system.interestRate, daysElapsed);
            updateData.push({
              uuid: actor.uuid,
              "system.money.debt": newDebt.toNearest(0.01),
            });
          }

          // Expire overdue consequences
          for (const c of actor.consequences.filter((c) => c.hasDuration)) {
            c.system.checkExpiration();
          }
        }
        massUpdate("Actor", updateData);
      }
    },
  );

  for (const trigger of Object.keys(timeOptions.triggers)) {
    foundry.helpers.Hooks.on(`teriock.force${ucFirst(trigger)}`, async () => {
      for (const actor of game.actors.visible) {
        if (game.user.id === actor.defaultUser.id) {
          actor?.system[`take${ucFirst(trigger)}`]();
        }
      }
    });
  }
}
