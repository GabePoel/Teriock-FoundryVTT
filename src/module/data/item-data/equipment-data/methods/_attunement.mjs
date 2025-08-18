import { evaluateSync } from "../../../../helpers/utils.mjs";

/**
 * Attunes equipment to the current character, creating an attunement effect.
 * Checks if the character has enough unused presence and handles reference equipment.
 *
 * @param {TeriockEquipmentData} equipmentData - The equipment data to attune.
 * @returns {Promise<TeriockEffect | null>} Promise that resolves to the attunement effect or null.
 * @private
 */
export async function _attune(equipmentData) {
  let attunement = _getAttunement(equipmentData);
  if (attunement) {
    return attunement;
  }
  const attunementData = {
    type: "attunement",
    name: `${equipmentData.parent.name} Attunement`,
    img: equipmentData.parent.img,
    system: {
      type: "equipment",
      target: equipmentData.parent._id,
      inheritTier: true,
      tier: equipmentData.tier.derived,
    },
    changes: [
      {
        key: "system.attunements",
        mode: 2,
        value: equipmentData.parent._id,
        priority: 10,
      },
      {
        key: "system.presence.value",
        mode: 2,
        value: equipmentData.tier.derived,
        priority: 10,
      },
    ],
  };
  if (equipmentData.parent.actor && (await _canAttune(equipmentData))) {
    if (equipmentData.reference && !equipmentData.identified) {
      const ref = await foundry.utils.fromUuid(equipmentData.reference);
      if (ref) {
        await equipmentData.parent.update({
          "system.tier.raw": ref.system.tier.raw,
        });
      }
    }
    attunement = await equipmentData.parent.actor.createEmbeddedDocuments(
      "ActiveEffect",
      [attunementData],
    );
    ui.notifications.success(
      `${equipmentData.parent.name} was successfully attuned.`,
    );
  } else {
    ui.notifications.error(
      `You do not have enough unused presence to attune ${equipmentData.parent.name}.`,
    );
  }
  return attunement;
}

/**
 * Removes attunement from equipment by deleting the attunement effect.
 *
 * @param {TeriockEquipmentData} equipmentData - The equipment data to deattune.
 * @returns {Promise<void>} Promise that resolves when the attunement is removed.
 * @private
 */
export async function _deattune(equipmentData) {
  const attunement = _getAttunement(equipmentData);
  if (attunement) {
    await attunement.delete();
  }
}

/**
 * Checks if equipment is currently attuned to the character.
 *
 * @param {TeriockEquipmentData} equipmentData - The equipment data to check.
 * @returns {boolean} True if the equipment is attuned, false otherwise.
 * @private
 */
export function _attuned(equipmentData) {
  if (equipmentData.parent?.actor) {
    return equipmentData.parent.actor.system.attunements.has(
      equipmentData.parent._id,
    );
  }
  return false;
}

/**
 * Gets the current attunement effect for the equipment.
 *
 * @param {TeriockEquipmentData} equipmentData - The equipment data to get attunement for.
 * @returns {TeriockAttunement | null} The attunement effect or null if not attuned.
 * @private
 */
export function _getAttunement(equipmentData) {
  if (equipmentData.parent?.actor) {
    return equipmentData.parent.actor.attunements.find(
      (effect) => effect.system.target === equipmentData.parent._id,
    );
  }
  return null;
}

/**
 * Checks if the character can attune to the equipment based on available presence.
 * Considers reference equipment tier if the equipment is not identified.
 *
 * @param {TeriockEquipmentData} equipmentData - The equipment data to check attunement for.
 * @returns {Promise<boolean>} Promise that resolves to true if attunement is possible, false otherwise.
 * @private
 */
export async function _canAttune(equipmentData) {
  if (equipmentData.parent?.actor) {
    let tierDerived = equipmentData.tier.derived;
    if (equipmentData.reference && !equipmentData.identified) {
      const ref = await foundry.utils.fromUuid(equipmentData.reference);
      const tierRaw = ref.system.tier.raw;
      tierDerived = evaluateSync(tierRaw);
    }
    const unp =
      equipmentData.parent.actor.system.presence.max -
      equipmentData.parent.actor.system.presence.value;
    return tierDerived <= unp;
  }
  return false;
}
