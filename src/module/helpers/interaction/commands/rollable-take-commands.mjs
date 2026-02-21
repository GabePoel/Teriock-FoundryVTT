import { boostDialog } from "../../../applications/dialogs/_module.mjs";
import { takeOptions } from "../../../constants/options/take-options.mjs";
import { BaseRoll, HarmRoll } from "../../../dice/rolls/_module.mjs";
import { TeriockChatMessage } from "../../../documents/_module.mjs";
import { formulaCommand } from "./abstract-command.mjs";

/**
 * An abstract primary take function.
 * @param {TeriockActor} actor
 * @param {Teriock.Interaction.TakeOptions} options
 */
async function abstractTakeOperation(actor, options) {
  options = cleanDataset(options);
  let formula = options.formula || "0";
  const type = options.type || "damage";
  const take = TERIOCK.options.take[type];
  if (options.apply) {
    const amount = await BaseRoll.getValue(formula, actor?.getRollData() || {});
    if (options.reverse) await take.reverse(actor, amount);
    else await take.apply(actor, amount);
    return;
  }
  if (options.boost) formula = await boostDialog(formula);
  const roll = new HarmRoll(formula, actor?.getRollData() || {}, {
    take: type,
  });
  if (options.crit) roll.alter(2, 0, { multiplyNumeric: false });
  await roll.evaluate();
  const messageData = {
    speaker: TeriockChatMessage.getSpeaker({ actor: actor }),
    system: {
      avatar: actor?.img,
    },
  };
  await roll.toMessage(messageData);
}

/**
 * Build a take function.
 * @param {Teriock.Interaction.TakeKey} type
 * @param {"primary" | "secondary"} operation
 * @returns {function(actor: TeriockActor, options: Teriock.Interaction.TakeOptions): Promise<void>}
 */
function takeOperationFactory(type, operation) {
  return async function (actor, options) {
    options.type = type;
    delete options.boost;
    if (operation === "primary") {
      options.boost = game.settings.get("teriock", "showRollDialogs");
      delete options.reverse;
    }
    if (operation === "secondary") {
      options.boost = !game.settings.get("teriock", "showRollDialogs");
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
    tooltip: (options) => (options.apply ? take.take : take.deal),
    icon: take.icon,
    primary: takeOperationFactory(type, "primary"),
    secondary: takeOperationFactory(type, "secondary"),
  };
});

export default rollableTakeCommands;

/**
 * Clean a dataset of boolean values.
 * @param {DOMStringMap} dataset
 * @returns {object}
 */
function cleanDataset(dataset) {
  const options = {};
  for (const [key, value] of Object.entries(dataset)) {
    if (value === "true") {
      options[key] = true;
    } else if (value === "false") {
      options[key] = false;
    } else {
      options[key] = value;
    }
  }
  return options;
}
