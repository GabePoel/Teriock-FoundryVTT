import { boostDialog } from "../../../applications/dialogs/_module.mjs";
import { takeOptions } from "../../../constants/options/take-options.mjs";
import { TeriockRoll } from "../../../dice/_module.mjs";
import { TeriockChatMessage } from "../../../documents/_module.mjs";
import {
  makeDamageDrainTypePanels,
  makeDamageTypeButtons,
} from "../../html.mjs";
import { TakeRollableTakeHandler } from "../button-handlers/rollable-takes-handlers.mjs";
import { formulaCommand } from "./abstract-command.mjs";

/**
 * An abstract primary take function.
 * @param {TeriockActor} actor
 * @param {Teriock.Interactions.TakeOptions} options
 */
async function abstractTakeOperation(actor, options) {
  let formula = options.formula || "0";
  const type = options.type || "damage";
  const take = TERIOCK.options.take[type];
  if (options.apply) {
    const amount = await TeriockRoll.getValue(
      formula,
      actor?.getRollData() || {},
    );
    if (options.reverse)
      await take.reverse(actor, amount); //import { commandHandlers } from "../../helpers/interaction/commands.mjs";
    else await take.apply(actor, amount);
    return;
  }
  const flavor = `Roll ${take.label}`;
  if (options.boost) formula = await boostDialog(formula);
  const roll = new TeriockRoll(formula, actor?.getRollData() || {}, { flavor });
  if (options.crit) roll.alter(2, 0, { multiplyNumeric: false });
  await roll.evaluate();
  const buttons = [TakeRollableTakeHandler.buildButton(type, roll.total)];
  if (type === "damage") buttons.push(...makeDamageTypeButtons(roll));
  const panels = [];
  if (["damage", "drain"].includes(type)) {
    panels.push(...(await makeDamageDrainTypePanels(roll)));
  }
  const messageData = {
    speaker: TeriockChatMessage.getSpeaker({ actor: actor }),
    rolls: [roll],
    system: {
      avatar: actor?.img,
      buttons: buttons,
      panels: panels,
    },
  };
  await TeriockChatMessage.create(messageData);
}

/**
 * Build a take function.
 * @param {Teriock.Interactions.TakeKey} type
 * @param {"primary" | "secondary"} operation
 * @returns {function(actor: TeriockActor, options: Teriock.Interactions.TakeOptions): Promise<void>}
 */
function takeOperationFactory(type, operation) {
  return async function (actor, options) {
    options.type = type;
    if (operation === "primary") {
      delete options.boost;
      delete options.reverse;
    }
    if (operation === "secondary") {
      options.boost = true;
      options.reverse = true;
    }
    return abstractTakeOperation(actor, options);
  };
}

const rollableTakeCommands = Object.entries(takeOptions).map(([type, take]) => {
  return {
    ...formulaCommand,
    aliases: take?.aliases || [],
    id: type,
    label: (options) => options.formula,
    tooltip: (options) =>
      options.apply ? `${take.prefix} ${take.label}` : `Roll ${take.label}`,
    icon: take.icon,
    primary: takeOperationFactory(type, "primary"),
    secondary: takeOperationFactory(type, "secondary"),
  };
});

export default rollableTakeCommands;
