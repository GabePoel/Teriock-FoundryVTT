/** @import TeriockEquipmentData from "../equipment-data.mjs"; */
/** @import TeriockEffect from "@client/documents/_module.mjs"; */

/**
 * @param {TeriockEquipmentData} equipmentData
 * @returns {Promise<TeriockEffect | null>}
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
      { key: "system.attunements", mode: 2, value: equipmentData.parent._id, priority: 10 },
      { key: "system.presence.value", mode: 2, value: equipmentData.tier.derived, priority: 10 },
    ],
  };
  if (equipmentData.parent.actor) {
    attunement = await equipmentData.parent.actor.createEmbeddedDocuments("ActiveEffect", [attunementData]);
  }
  return attunement;
}

/**
 * @param {TeriockEquipmentData} equipmentData
 * @returns {Promise<void>}
 * @private
 */
export async function _deattune(equipmentData) {
  const attunement = _getAttunement(equipmentData);
  if (attunement) {
    await attunement.delete();
  }
}

/**
 * @param {TeriockEquipmentData} equipmentData
 * @returns {boolean}
 * @private
 */
export function _attuned(equipmentData) {
  if (equipmentData.parent?.actor) {
    return equipmentData.parent.actor.system.attunements.has(equipmentData.parent._id);
  }
  return false;
}

/**
 * @param {TeriockEquipmentData} equipmentData
 * @returns {TeriockAttunementData | null}
 * @private
 */
export function _getAttunement(equipmentData) {
  if (equipmentData.parent?.actor) {
    return equipmentData.parent.actor.effectTypes?.attunement?.find(
      (effect) => effect.system.target === equipmentData.parent._id,
    );
  }
  return null;
}
