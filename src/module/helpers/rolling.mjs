/**
 * Make common roll options.
 * @param {PointerEvent} event
 * @returns {Teriock.RollOptions.CommonRoll | Teriock.RollOptions.EquipmentRoll}
 */
export function makeCommonRollOptions(event) {
  let secret = game.settings.get("teriock", "secretEquipment");
  if (event.shiftKey) {
    secret = !secret;
  }
  return {
    advantage: event.altKey,
    disadvantage: event.shiftKey,
    crit: event.altKey,
    secret: secret,
    twoHanded: event.ctrlKey,
  };
}
