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
 * Generate a function that takes a time command for all relevant actors.
 * @param {Teriock.System.TimeTrigger} trigger
 * @returns {(function(): void)}
 */
function fireTimeTriggerFactory(trigger) {
  return function fireTrigger() {
    if (game.actors.relevant.length) { game.teriock.commands.take(trigger, game.actors.relevant); }
  };
}

const timeHookEntries = [
  ["updateWorldTime", increaseDebt],
  ...Object.keys(TERIOCK.CONFIG.trigger.time.choices).map(
    t => [`teriock.force${t.capitalize()}`, fireTimeTriggerFactory(t)]
  ),
];

export default timeHookEntries;
