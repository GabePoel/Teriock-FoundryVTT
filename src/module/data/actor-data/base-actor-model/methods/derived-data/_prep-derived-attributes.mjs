import { TeriockActor } from "../../../../../documents/_module.mjs";

/**
 * Prepares attribute saves and movement-related derived data.
 * Calculates save bonuses based on proficiency and fluency, movement speed, and carrying capacity.
 * @param {TeriockBaseActorData} actorData - The actor's base data system object.
 * @returns {void} Modifies the system object in place.
 * @private
 */
export function _prepDerivedAttributes(actorData) {
  for (const att of Object.keys(TERIOCK.index.attributes)) {
    actorData.attributes[att].score.evaluate();
    actorData.attributes[att].passive.evaluate();
  }
  _preparePresence(actorData);
  const { attributes, scaling } = actorData;
  Object.values(attributes).forEach((attr) => {
    const bonus = attr.saveFluent
      ? scaling.f
      : attr.saveProficient
        ? scaling.p
        : 0;
    attr.saveBonus = attr.score.value * 2 + bonus;
  });
  actorData.size.number.evaluate();
  actorData.weight.self.evaluate();
  const sizeDefinition = TeriockActor.sizeDefinition(
    actorData.size.number.value,
  );
  actorData.size.category = sizeDefinition.category;
  // Convert from feet to tiles
  actorData.size.length = sizeDefinition.length / 5;
  actorData.size.reach = sizeDefinition.reach;
  const mov = attributes.mov.score.value;
  const str = attributes.str.score.value;
  const strFactor =
    actorData.size.number.value < 5
      ? str
      : str + Math.pow(actorData.size.number.value - 5, 2);
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
 * @param {TeriockBaseActorData} actorData - The actor's base data system object.
 * @returns {void} Modifies the system object in place.
 * @private
 */
export function _preparePresence(actorData) {
  actorData.presence.overflow =
    actorData.presence.value > actorData.presence.max;
  actorData.presence.value = Math.min(
    actorData.presence.value,
    actorData.presence.max,
  );
  actorData.attributes.unp.score.value =
    actorData.presence.max - actorData.presence.value;
}
