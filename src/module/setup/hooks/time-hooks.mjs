import { ucFirst } from "../../helpers/string.mjs";
import {
  buildWriteOperation,
  consolidateWriteOperations,
} from "../../helpers/utils.mjs";

export default function registerTimeManagementHooks() {
  foundry.helpers.Hooks.on(
    "updateWorldTime",
    async (_worldTime, dt, _options, userId) => {
      if (game.user.id === userId && game.user.isActiveGM) {
        const operations = [];
        for (const actor of game.actors.relevant) {
          // Increase debt
          if (actor.system.money.debt > 0 && actor.system.interestRate > 0) {
            const daysElapsed = dt / 86400;
            const newDebt =
              actor.system.money.debt *
              Math.pow(1 + actor.system.interestRate, daysElapsed);
            operations.push({
              action: "update",
              docData: { "system.money.debt": newDebt.toNearest(0.01) },
              uuid: actor.uuid,
            });
          }
        }
        const indOps = await Promise.all(
          operations.map(async (op) => buildWriteOperation(op)),
        );
        const conOps = consolidateWriteOperations(indOps.filter((_) => _));
        await foundry.documents.modifyBatch(conOps);
      }
    },
  );

  for (const trigger of Object.keys(TERIOCK.system.triggers.time.choices)) {
    foundry.helpers.Hooks.on(`teriock.force${ucFirst(trigger)}`, async () => {
      for (const actor of game.actors.visible) {
        if (game.user.id === actor.defaultUser.id) {
          actor?.system[`take${ucFirst(trigger)}`]();
        }
      }
    });
  }
}
