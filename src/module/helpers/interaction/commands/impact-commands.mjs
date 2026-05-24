import { boostDialog } from "../../../applications/dialogs/_module.mjs";
import { impactConfig } from "../../../constants/config/impact-config.mjs";
import { BaseRoll, HarmRoll } from "../../../dice/rolls/_module.mjs";
import { TeriockChatMessage } from "../../../documents/_module.mjs";
import { cleanDataset } from "../../html.mjs";
import { formulaCommand } from "./abstract-command.mjs";

/**
 * An abstract primary take function.
 * @param {TeriockActor} actor
 * @param {Teriock.Interaction.ImpactOptions} options
 */
async function abstractImpactCommandOperation(actor, options) {
  options = cleanDataset(options);
  let formula = options.formula || "0";
  const impact = options.impact || "damage";
  const config = TERIOCK.config.impact[impact];
  if (options.apply) {
    if (!game.actors.check(actor)) return;
    const amount = await BaseRoll.getValue(formula, actor?.getRollData() || {});
    if (options.reverse) await config.reverse(actor, amount);
    else await config.apply(actor, amount);
    return;
  }
  const rollData = Object.assign(options.rollData ?? {}, actor?.getRollData() || {});
  if (options.boost)
    formula = await boostDialog(formula, { boosts: options.boosts, document: options.document, impact, rollData });
  if (!formula) return;
  const roll = new HarmRoll(formula, rollData, { impact: impact });
  if (options.crit) roll.alter(2, 0, { multiplyNumeric: false });
  await roll.evaluate();
  const messageData = { speaker: TeriockChatMessage.getSpeaker({ actor: actor }), system: { avatar: actor?.img } };
  await roll.toMessage(messageData);
}

/**
 * Build an impact function.
 * @param {Teriock.Keys.Impact} impact
 * @param {"primary" | "secondary"} operation
 * @returns {Teriock.Interaction.SimpleCommandFunction<Teriock.Interaction.ImpactOptions>}
 */
function impactCommandFunctionFactory(impact, operation) {
  return async function(actor, options) {
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
    return abstractImpactCommandOperation(actor, options);
  };
}

const impactCommands = Object.entries(impactConfig).map(([impact, config]) => {
  return {
    ...formulaCommand,
    aliases: config?.aliases || [],
    icon: config.icon,
    id: impact,
    primary: impactCommandFunctionFactory(impact, "primary"),
    secondary: impactCommandFunctionFactory(impact, "secondary"),
    label: options => options.formula,
    tooltip: options => (options.apply ? config.take : config.deal),
  };
});

export default impactCommands;
