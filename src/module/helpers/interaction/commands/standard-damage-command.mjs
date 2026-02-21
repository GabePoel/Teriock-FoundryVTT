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
      game.i18n.format("TERIOCK.COMMANDS.StandardDamage.noDefaultWeapon", {
        name: actor.name,
      }),
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
      game.i18n.format("TERIOCK.COMMANDS.StandardDamage.noDefaultWeapon", {
        name: actor.name,
      }),
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
  label: "TERIOCK.EFFECTS.Common.standardDamage",
  primary,
  secondary,
};

export default command;
