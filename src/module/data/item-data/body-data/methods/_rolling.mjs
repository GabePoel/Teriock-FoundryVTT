import { onUseDialog } from "../../../../applications/dialogs/on-use-dialog.mjs";
import { TeriockRoll } from "../../../../dice/_module.mjs";
import { harmRoll } from "../../../../helpers/quick-rolls.mjs";

/**
 * @param {TeriockBodyModel} bodyData
 * @param {object} options
 * @returns {Promise<void>}
 * @private
 */
export async function _roll(bodyData, options) {
  let message = await bodyData.parent.buildMessage();
  if (bodyData.damage.base.value) {
    let rollFormula = bodyData.damage.base.value || "";
    if (options.formula) {
      rollFormula = options.formula;
    }
    rollFormula = rollFormula.trim();

    if (options?.bonusDamage) {
      rollFormula = rollFormula + " + " + options.bonusDamage;
    }
    if (options?.advantage) {
      rollFormula = new TeriockRoll(rollFormula).alter(2, 0, {
        multiplyNumeric: false,
      }).formula;
    }
    const rollData = bodyData.actor?.getRollData() || {};
    await harmRoll(rollFormula, rollData, message);
  } else {
    await bodyData.parent.chat();
  }
  const onUseId = await onUseDialog(bodyData.parent);
  if (onUseId) {
    /** @type {TeriockAbility} */
    const onUseAbility = bodyData.parent.effects.get(onUseId);
    if (onUseAbility.system.consumable && bodyData.consumable) {
      if (onUseAbility.system.quantity !== 1) {
        await bodyData.parent.setFlag("teriock", "dontConsume", true);
      }
    }
    if (onUseAbility) {
      await onUseAbility.use();
    }
  }
}
