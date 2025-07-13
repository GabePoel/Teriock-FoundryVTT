import TeriockHarmRoll from "../../../../documents/harm.mjs";

/**
 * Initiates an equipment roll with the specified options.
 *
 * @param {TeriockEquipmentData} equipmentData - The equipment data to roll for.
 * @param {object} options - Options for the equipment roll including twoHanded, bonusDamage, advantage, and secret.
 * @returns {Promise<void>} Promise that resolves when the roll is complete.
 * @private
 */
export async function _roll(equipmentData, options) {
  await use(equipmentData, options);
}

/**
 * Performs the actual equipment roll, creating a harm roll with damage types and modifiers.
 * Handles damage formula construction, damage types, and roll options.
 *
 * @param {TeriockEquipmentData} equipmentData - The equipment data to roll for.
 * @param {Teriock.EquipmentRollOptions} options - Options for the equipment roll including twoHanded, bonusDamage,
 *   advantage, and secret.
 * @returns {Promise<void>} Promise that resolves when the roll message is sent.
 * @private
 */
async function use(equipmentData, options) {
  let message = await equipmentData.parent.buildMessage();
  if (equipmentData.damage) {
    let rollFormula = equipmentData.damage || "";
    rollFormula = rollFormula.trim();

    // let damageTypes = equipmentData.damageTypes || [];
    let damageTypes = [];
    if (equipmentData.powerLevel === "magic") {
      damageTypes.push("magic");
    }
    const effectDamageTypes = equipmentData.parent.effects
      .filter((effect) => {
        return effect.type === "property" && !effect.disabled && effect.system.damageType;
      })
      .map((effect) => (effect.system.damageType ? effect.system.damageType.toLowerCase() : effect.system.damageType));
    if (
      equipmentData.parent.effects.some(
        (effect) =>
          effect.type === "property" && !effect.disabled && (effect.name === "Flaming" || effect.name === "Burning"),
      )
    ) {
      effectDamageTypes.push("fire");
    }
    // Ensure all damage types are lower case
    damageTypes = [...new Set([...damageTypes, ...effectDamageTypes])].map((dt) =>
      dt && typeof dt === "string" ? dt.toLowerCase() : dt,
    );
    if (damageTypes.length > 0 && rollFormula.length > 0 && rollFormula !== "0") {
      damageTypes.sort((a, b) => a.localeCompare(b));
      rollFormula += "[" + damageTypes.join(" ") + "]";
    }

    if (options?.twoHanded && equipmentData.twoHandedDamage) {
      rollFormula = equipmentData.twoHandedDamage || rollFormula;
    }
    if (options?.bonusDamage) {
      rollFormula = rollFormula + " + " + options.bonusDamage;
    }
    if (equipmentData.actor?.system?.damage?.standard) {
      rollFormula += equipmentData.actor.system.damage.standard;
    }
    if (options?.secret) {
      message = await equipmentData.parent.buildMessage({ secret: true });
    } else {
      message = await equipmentData.parent.buildMessage({ secret: false });
    }
    const rollData = equipmentData.actor?.getRollData() || {};
    let roll = new TeriockHarmRoll(rollFormula, rollData, { message: message });
    if (options?.advantage) {
      roll = roll.alter(2, 0);
    }
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({
        actor: equipmentData.actor,
      }),
    });
  } else {
    equipmentData.parent.chat();
  }
}
