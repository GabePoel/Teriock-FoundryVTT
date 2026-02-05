import { boostDialog } from "../../../applications/dialogs/_module.mjs";
import { icons } from "../../../constants/display/icons.mjs";
import { pureUuid } from "../../resolve.mjs";

/**
 * @param {TeriockActor} actor
 * @param {Teriock.Interactions.StandardDamageOptions} options
 * @returns {Promise<void>}
 */
async function primary(actor, options = {}) {
  let attacker = actor.system.primaryAttacker;
  if (options.attacker) {
    attacker = await fromUuid(pureUuid(options.attacker));
  }
  if (!attacker) {
    ui.notifications.error(
      `${actor.name} doesn't have a default attack weapon.`,
    );
    return;
  }
  await attacker.use({
    secret: true,
    crit: options.crit || false,
    twoHanded: options.twoHanded || false,
  });
}

/**
 * @param {TeriockActor} actor
 * @param {Teriock.Interactions.StandardDamageOptions} options
 * @returns {Promise<void>}
 */
async function secondary(actor, options = {}) {
  let attacker = actor.system.primaryAttacker;
  if (options.attacker) {
    attacker = await fromUuid(pureUuid(options.attacker));
  }
  if (!attacker) {
    ui.notifications.error(
      `${actor.name} doesn't have a default attack weapon.`,
    );
    return;
  }
  let formula = attacker.system.damage.base.formula;
  if (options.twoHanded && attacker.system.hasTwoHandedAttack) {
    formula = attacker.system.damage.twoHanded.formula;
  }
  formula = await boostDialog(formula, { crit: options.crit || false });
  await attacker.use({
    secret: true,
    formula,
  });
}

/**
 * Standard damage command
 * @type {Teriock.Interactions.CommandEntry}
 */
const command = {
  aliases: ["sd", "standard"],
  alt: "crit",
  ctrl: "twoHanded",
  icon: icons.effect.dealDamage,
  id: "standardDamage",
  label: "Standard Damage",
  primary,
  secondary,
};

export default command;
