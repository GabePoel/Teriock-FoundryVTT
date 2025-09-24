import { deriveModifiableNumber } from "../../../../shared/fields/modifiable.mjs";

const SIZE_DEFINITIONS = [
  {
    max: 0.5,
    length: 2.5,
    category: "tiny",
    reach: 5,
  },
  {
    max: 2,
    length: 5,
    category: "small",
    reach: 5,
  },
  {
    max: 4,
    length: 5,
    category: "medium",
    reach: 5,
  },
  {
    max: 9,
    length: 10,
    category: "large",
    reach: 10,
  },
  {
    max: 14,
    length: 15,
    category: "huge",
    reach: 15,
  },
  {
    max: 20,
    length: 20,
    category: "gargantuan",
    reach: 20,
  },
  {
    max: Infinity,
    length: 30,
    category: "colossal",
    reach: 30,
  },
];

/**
 * Get the definition of several fields for a given numerical size value.
 * @param {number} value
 * @returns {{ max: number, length: number, category: string, reach: number }}
 * @private
 */
export function _sizeDefinition(value) {
  const lessThanEqualSizes = SIZE_DEFINITIONS.map((d) => d.max).filter(
    (m) => m <= value,
  );
  const sizeDefinitionMax = Math.max(...lessThanEqualSizes);
  return foundry.utils.deepClone(
    SIZE_DEFINITIONS.find((d) => d.max === sizeDefinitionMax),
  );
}

/**
 * Prepares attribute saves and movement-related derived data.
 * Calculates save bonuses based on proficiency and fluency, movement speed, and carrying capacity.
 * @param {TeriockBaseActorModel} actorData - The actor's base data system object.
 * @returns {void} Modifies the system object in place.
 * @private
 */
export function _prepDerivedAttributes(actorData) {
  _preparePresence(actorData);
  const { attributes, scaling } = actorData;
  Object.values(attributes).forEach((attr) => {
    const bonus = attr.saveFluent
      ? scaling.f
      : attr.saveProficient
        ? scaling.p
        : 0;
    attr.saveBonus = attr.value * 2 + bonus;
  });
  deriveModifiableNumber(actorData.size.number, {
    min: 0,
    max: 30,
  });
  const sizeDefinition = _sizeDefinition(actorData.size.number.value);
  actorData.size.category = sizeDefinition.category;
  // Convert from feet to tiles
  actorData.size.length = sizeDefinition.length / 5;
  actorData.size.reach = sizeDefinition.reach;
  const mov = attributes.mov.value;
  const str = attributes.str.value;
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
 * @param {TeriockBaseActorModel} actorData - The actor's base data system object.
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
  actorData.attributes.unp.value =
    actorData.presence.max - actorData.presence.value;
}
