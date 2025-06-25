/** @import TeriockEquipmentData from "../equipment-data.mjs"; */
import TeriockHarmRoll from "../../../../documents/harm.mjs";

/**
 * @param {TeriockEquipmentData} equipmentData
 * @param {object} options
 * @returns {Promise<void>}
 */
export async function _roll(equipmentData, options) {
  await use(equipmentData, options);
}

/**
 * @param {TeriockEquipmentData} equipmentData
 * @param {object} options
 * @returns {Promise<void>}
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
    damageTypes = [...new Set([...damageTypes, ...effectDamageTypes])].map(dt => dt && typeof dt === "string" ? dt.toLowerCase() : dt);
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
    if (equipmentData.parent.getActor()?.system?.damage?.standard) {
      rollFormula += equipmentData.parent.getActor().system.damage.standard;
    }
    // if (options?.advantage) {
    //   rollFormula = rollFormula.replace(/(\d*)d(\d+)/gi, (match, dice, sides) => {
    //     const numDice = parseInt(dice) || 1;
    //     return (numDice * 2) + 'd' + sides;
    //   });
    // }
    if (options?.secret) {
      message = await equipmentData.parent.buildMessage({ secret: true });
    } else {
      message = await equipmentData.parent.buildMessage({ secret: false });
    }
    const rollData = equipmentData.parent.getActor()?.getRollData() || {};
    let roll = new TeriockHarmRoll(rollFormula, rollData, { message: message });
    if (options?.advantage) {
      roll = roll.alter(2, 0);
    }
    roll.toMessage({
      speaker: ChatMessage.getSpeaker({
        actor: equipmentData.parent.getActor(),
      }),
    });
  } else {
    equipmentData.parent.chat();
  }
}
