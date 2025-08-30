/**
 * Prepares attribute saves and movement-related derived data.
 * Calculates save bonuses based on proficiency and fluency, movement speed, and carrying capacity.
 *
 * @param {TeriockBaseActorData} actorData - The actor's base data system object.
 * @returns {void} Modifies the system object in place.
 * @private
 */
export function _prepareAttributes(actorData) {
  _preparePresence(actorData);
  const { attributes, size, f, p } = actorData;
  Object.values(attributes).forEach((attr) => {
    const bonus = attr.saveFluent ? f : attr.saveProficient ? p : 0;
    attr.saveBonus = attr.value * 2 + bonus;
  });
  const mov = attributes.mov.value;
  const str = attributes.str.value;
  const strFactor = size < 5 ? str : str + Math.pow(size - 5, 2);
  const base = 65 + 20 * strFactor;
  actorData.movementSpeed.value = Math.max(
    30 + 10 * mov + actorData.movementSpeed.base,
    0,
  );
  actorData.carryingCapacity = {
    light: base,
    heavy: base * 2,
    max: base * 3,
  };
}

/**
 * Prepares presence-related derived data.
 * Calculates presence overflow, maximum presence, and used/unused presence points.
 *
 * @param {TeriockBaseActorData} actorData - The actor's base data system object.
 * @returns {void} Modifies the system object in place.
 */
export function _preparePresence(actorData) {
  actorData.presence.overflow = actorData.presence.value > actorData.presence.max;
  actorData.presence.value = Math.min(actorData.presence.value, actorData.presence.max);
  actorData.attributes.unp.value = actorData.presence.max - actorData.presence.value;
}
