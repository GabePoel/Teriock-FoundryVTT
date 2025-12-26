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
 * Standard damage command
 * @type {Teriock.Interactions.CommandEntry}
 */
const command = {
  aliases: ["sd", "standard"],
  icon: "hammer-crash",
  id: "standardDamage",
  label: "Standard Damage",
  primary,
};

export default command;
