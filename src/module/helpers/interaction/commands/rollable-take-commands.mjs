import { boostDialog } from "../../../applications/dialogs/_module.mjs";
import { impactConfig } from "../../../constants/config/impact-config.mjs";
import { BaseRoll, HarmRoll } from "../../../dice/rolls/_module.mjs";
import { TeriockChatMessage } from "../../../documents/_module.mjs";
import { cleanDataset } from "../../html.mjs";
import { formulaCommand } from "./abstract-command.mjs";

/**
 * An abstract primary take function.
 * @param {TeriockActor} actor
 * @param {Teriock.Interaction.TakeOptions} options
 */
async function abstractTakeOperation(actor, options) {
  options = cleanDataset(options);
  let formula = options.formula || "0";
  const impact = options.impact || "damage";
  const take = TERIOCK.config.impact[impact];
  if (options.apply) {
    const amount = await BaseRoll.getValue(formula, actor?.getRollData() || {});
    if (options.reverse) await take.reverse(actor, amount);
    else await take.apply(actor, amount);
    return;
  }
  const rollData = actor?.getRollData() || {};
  if (options.boost) {
    formula = await boostDialog(formula, {
      type: TERIOCK.config.impact[impact].label,
      rollData,
    });
  }
  if (!formula) return;
  const roll = new HarmRoll(formula, rollData, { impact: impact });
  if (options.crit) roll.alter(2, 0, { multiplyNumeric: false });
  await roll.evaluate();
  const messageData = {
    speaker: TeriockChatMessage.getSpeaker({ actor: actor }),
    system: { avatar: actor?.img },
  };
  await roll.toMessage(messageData);
}

/**
 * Build a take function.
 * @param {Teriock.Keys.Impact} impact
 * @param {"primary" | "secondary"} operation
 * @returns {function(actor: TeriockActor, options: Teriock.Interaction.TakeOptions): Promise<void>}
 */
function takeOperationFactory(impact, operation) {
  return async function (actor, options) {
    options.impact = impact;
    delete options.boost;
    if (operation === "primary") {
      options.boost = game.teriock.getSetting("showRollDialogs");
      delete options.reverse;
    }
    if (operation === "secondary") {
      options.boost = !game.teriock.getSetting("showRollDialogs");
      options.reverse = true;
    }
    return abstractTakeOperation(actor, options);
  };
}

const rollableTakeCommands = Object.entries(impactConfig).map(
  ([impact, config]) => {
    return {
      ...formulaCommand,
      aliases: config?.aliases || [],
      id: impact,
      label: (options) => options.formula,
      tooltip: (options) => (options.apply ? config.take : config.deal),
      icon: config.icon,
      primary: takeOperationFactory(impact, "primary"),
      secondary: takeOperationFactory(impact, "secondary"),
    };
  },
);

export default rollableTakeCommands;
