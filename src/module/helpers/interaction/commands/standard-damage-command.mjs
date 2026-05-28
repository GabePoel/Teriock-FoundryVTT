import { selectDocumentDialog } from "../../../applications/dialogs/select-document-dialog.mjs";
import { icons } from "../../../constants/display/icons.mjs";

/**
 * @param {TeriockActor} actor
 * @param {Teriock.Command.StandardDamageOptions} options
 * @returns {Promise<void>}
 */
async function use(actor, options = {}) {
  if (!game.actors.check(actor)) return;
  if (options.event?.shiftKey) options.select = true;
  let attacker = actor?.system?.wielding.attacker;
  if (options.armament) {
    const newAttacker = await foundry.utils.fromUuid(options.armament, { relative: actor });
    if (newAttacker) attacker = newAttacker;
  }
  if (options.select) {
    const selOpts = { noDocumentsMessage: "TERIOCK.DIALOGS.Common.ERRORS.noRelevantItems" };
    if (attacker?.uuid) selOpts.checked = attacker.uuid;
    attacker = await selectDocumentDialog(actor.armaments.filter(a => a.active), selOpts);
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
 * @type {Teriock.Command.CommandEntry}
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
