import { icons } from "../../../constants/display/icons.mjs";
import { pureUuid } from "../../resolve.mjs";

/**
 * @param {TeriockActor} actor
 * @param {Teriock.Interaction.StandardDamageOptions} options
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
  await attacker.use(
    Object.assign(options, {
      showDialog: game.settings.get("teriock", "showRollDialogs"),
    }),
  );
}

/**
 * @param {TeriockActor} actor
 * @param {Teriock.Interaction.StandardDamageOptions} options
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
  await attacker.use(
    Object.assign(options, {
      showDialog: !game.settings.get("teriock", "showRollDialogs"),
    }),
  );
}

/**
 * Standard damage command
 * @type {Teriock.Interaction.CommandEntry}
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
