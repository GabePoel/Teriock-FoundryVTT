import { icons } from "../../../constants/display/icons.mjs";
import { pureUuid } from "../../resolve.mjs";

/**
 * @param {TeriockActor} actor
 * @param {Teriock.Interaction.StandardDamageOptions} options
 * @returns {Promise<void>}
 */
async function use(actor, options = {}) {
  let attacker = actor?.system?.primaryAttacker;
  if (options.attacker) {
    attacker = await fromUuid(pureUuid(options.attacker));
  }
  if (!attacker) {
    ui.notifications.error("TERIOCK.COMMANDS.StandardDamage.noDefaultWeapon", {
      format: { name: actor.name },
      localize: true,
    });
    return;
  }
  await attacker.use(options);
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
  primary: use,
  secondary: use,
};

export default command;
