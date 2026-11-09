import { batchWrite } from "../../utils/_module.mjs";

/**
 * Increase debt for all relevant actors.
 * @param {number} _worldTime
 * @param {number} dt
 * @see {updateWorldTime}
 */
async function increaseDebt(_worldTime, dt) {
  if (!game.user.isActiveGM) { return; }
  const operations = [];
  for (const actor of game.actors.relevant) {
    if (actor.system.money.debt > 0 && actor.system.interestRate > 0) {
      const daysElapsed = dt / 86400;
      const newDebt = actor.system.money.debt * Math.pow(1 + actor.system.interestRate / 100, daysElapsed);
      operations.push({
        action: "update",
        docData: { "system.money.debt": newDebt.toNearest(0.01) },
        uuid: actor.uuid,
      });
    }
  }
  await batchWrite(operations);
}

/**
 * Refresh the time displayed in the world tab.
 * @see {updateWorldTime}
 */
function renderWorldTime() {
  ui.world?.render({ parts: ["header"] });
}

const timeHookEntries = [["updateWorldTime", increaseDebt], ["updateWorldTime", renderWorldTime]];

export default timeHookEntries;
