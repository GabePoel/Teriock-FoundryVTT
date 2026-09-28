import triggerConfig from "../../constants/config/trigger-config.mjs";
import { batchWrite } from "../../helpers/utils.mjs";

/**
 * Increase debt for all relevant actors.
 * @param {number} _worldTime
 * @param {number} dt
 * @param {object} _options
 * @param {ID<TeriockUser>} userId
 * @see {updateWorldTime}
 */
async function increaseDebt(_worldTime, dt, _options, userId) {
  if (game.user.id !== userId || !game.user.isActiveGM) { return; }
  const operations = [];
  for (const actor of game.actors.relevant) {
    if (actor.system.money.debt > 0 && actor.system.interestRate > 0) {
      const daysElapsed = dt / 86400;
      const newDebt = actor.system.money.debt * Math.pow(1 + actor.system.interestRate, daysElapsed);
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
 * Generate a trigger fire function.
 * @param {Teriock.System.TimeTrigger} trigger
 * @returns {(function(): void)}
 */
function fireTimeTriggerFactory(trigger) {
  return function fireTrigger() {
    for (const actor of game.actors.visible) { actor.takeTimeTrigger(trigger); }
  };
}

const timeHookEntries = [
  ["updateWorldTime", increaseDebt],
  ...Object.keys(triggerConfig.time.choices).map(t => [`teriock.force${t.capitalize()}`, fireTimeTriggerFactory(t)]),
];

export default timeHookEntries;
