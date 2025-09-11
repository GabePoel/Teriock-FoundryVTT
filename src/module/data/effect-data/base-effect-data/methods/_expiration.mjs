/**
 * Checks if an effect should expire based on its duration and current game state.
 * Considers both world time and combat turn progression for expiration timing.
 *
 * @param {TeriockBaseEffectData} effectData - The effect data to check for expiration.
 * @returns {boolean} True if the effect should expire, false otherwise.
 * @private
 */
export function _shouldExpire(effectData) {
  const effect = effectData.parent;
  if (!effect.isTemporary) {
    return false;
  }
  const duration = effect.duration;
  const currentTime = game.time.worldTime;
  if (!duration || duration.startTime === undefined || duration.seconds === undefined) {
    return false;
  }
  const expirationTime = duration.startTime + duration.seconds;
  return currentTime > expirationTime;
}

/**
 * Expires an effect by either deleting it or disabling it.
 * The behavior depends on the effect's deleteOnExpire setting.
 *
 * @param {TeriockBaseEffectData} effectData - The effect data to expire.
 * @returns {Promise<void>} Promise that resolves when the effect is expired.
 * @private
 */
export async function _expire(effectData) {
  if (effectData.deleteOnExpire) {
    await effectData.parent.delete();
  } else {
    await effectData.parent.update({ disabled: true });
  }
}
