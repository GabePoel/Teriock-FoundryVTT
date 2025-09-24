import { onUseDialog } from "../../../../applications/dialogs/on-use-dialog.mjs";
import { TeriockRoll } from "../../../../dice/_module.mjs";
import { harmRoll } from "../../../../helpers/quick-rolls.mjs";

/**
 * Initiates an equipment roll with the specified options.
 * @param {TeriockEquipmentModel} equipmentData - The equipment data to roll for.
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
 * @param {TeriockEquipmentModel} equipmentData - The equipment data to roll for.
 * @param {Teriock.RollOptions.EquipmentRoll} options - Options for the equipment roll including twoHanded, bonusDamage,
 *   advantage, and secret.
 * @returns {Promise<void>} Promise that resolves when the roll message is sent.
 * @private
 */
async function use(equipmentData, options) {
  let message = await equipmentData.parent.buildMessage();
  if (equipmentData.damage.base.value) {
    let rollFormula = equipmentData.damage.base.value || "";
    if (options.formula) {
      rollFormula = options.formula;
    }
    rollFormula = rollFormula.trim();

    if (options?.twoHanded && equipmentData.damage.twoHanded.value) {
      rollFormula = equipmentData.damage.twoHanded.value || rollFormula;
    }
    if (options?.bonusDamage) {
      rollFormula = rollFormula + " + " + options.bonusDamage;
    }
    if (options?.advantage) {
      rollFormula = new TeriockRoll(rollFormula).alter(2, 0, {
        multiplyNumeric: false,
      }).formula;
    }
    if (options?.secret) {
      message = await equipmentData.parent.buildMessage({ secret: true });
    } else {
      message = await equipmentData.parent.buildMessage({ secret: false });
    }
    const rollData = equipmentData.actor?.getRollData() || {};
    await harmRoll(rollFormula, rollData, message);
  } else {
    await equipmentData.parent.chat();
  }
  const onUseId = await onUseDialog(equipmentData.parent);
  if (onUseId) {
    /** @type {TeriockAbility} */
    const onUseAbility = equipmentData.parent.effects.get(onUseId);
    if (onUseAbility.system.consumable && equipmentData.consumable) {
      if (onUseAbility.system.quantity !== 1) {
        await equipmentData.parent.setFlag("teriock", "dontConsume", true);
      }
    }
    if (onUseAbility) {
      await onUseAbility.use();
    }
    if (!(await equipmentData.parent.getFlag("teriock", "dontConsume"))) {
      const updates = [];
      for (const ability of equipmentData.parent.abilities) {
        const update = {};
        if (
          ability.system.maxQuantity.value &&
          ability.system.maxQuantity.value !== Infinity
        ) {
          update["_id"] = ability.id;
          update["system.quantity"] = ability.system.maxQuantity.value;
          updates.push(update);
        }
      }
      await equipmentData.parent.updateEmbeddedDocuments(
        "ActiveEffect",
        updates,
      );
    }
  }
}
