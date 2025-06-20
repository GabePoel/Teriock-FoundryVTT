/** @import TeriockBaseEffectData from "../base-data.mjs" */

/**
 * @param {TeriockBaseEffectData} effectData
 * @returns {boolean}
 */
export function _shouldExpire(effectData) {
  const effect = effectData.parent;
  if (!effect.isTemporary) return false;
  const duration = effect.duration;
  const currentTime = game.time.worldTime;
  const combat = game.combat;
  if (!duration || duration.startTime === undefined || duration.seconds === undefined) return false;
  const expirationTime = duration.startTime + duration.seconds;
  if (!combat || !combat.active) {
    return currentTime >= expirationTime;
  }
  if (currentTime > expirationTime) return true;
  if (currentTime < expirationTime) return false;
  const currentTurn = combat.turn ?? 0;
  const startTurn = duration.startTurn ?? 0;
  return currentTurn > startTurn;
}

/**
 * @param {TeriockBaseEffectData} effectData
 * @returns {Promise<void>}
 */
export async function _expire(effectData) {
  if (effectData.deleteOnExpire) {
    await effectData.parent.delete();
  } else {
    await effectData.parent.update({ disabled: true });
  }
}
