import impactConfig from "../../../constants/config/impact-config.mjs";
import { BaseRoll } from "../../../dice/rolls/_module.mjs";
import { ImpactsExecution } from "../../../executions/activity-executions/_module.mjs";
import { formulaCommand } from "./abstract-command.mjs";

/**
 * An abstract primary take function.
 * @param {TeriockActor} actor
 * @param {Teriock.Command.ImpactOptions} options
 */
async function abstractImpactCommandOperation(actor, options) {
  const formula = options.formula || "0";
  const impact = options.impact || "damage";
  const config = TERIOCK.config.impact[impact];
  if (options.apply) {
    if (!game.actors.check(actor)) { return; }
    const amount = await BaseRoll.getValue(formula, actor?.getRollData() || {});
    if (options.reverse) { await config.reverse(actor, amount); }
    else { await config.apply(actor, amount); }
    return;
  }
  const netBoosts = options.boosts ?? 0;
  await ImpactsExecution.create({
    boosts: Math.max(netBoosts, 0),
    crit: options.crit,
    deboosts: Math.max(-netBoosts, 0),
    formula,
    impacts: [impact],
  }, { actor, document: options.document, rollData: options.rollData, showDialog: options.boost });
}

/**
 * Build an impact function.
 * @param {Teriock.Keys.Impact} impact
 * @param {"primary" | "secondary"} operation
 * @returns {Teriock.Command.SimpleCommandFunction<Teriock.Command.ImpactOptions>}
 */
function impactCommandFunctionFactory(impact, operation) {
  return async function(actor, options) {
    options.impact = impact;
    delete options.boost;
    if (operation === "primary") {
      options.boost = game.settings.get("teriock", "showRollDialogs");
      delete options.reverse;
    }
    if (operation === "secondary") {
      options.boost = !game.settings.get("teriock", "showRollDialogs");
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
