export const thresholdCommand = {
  alt: "advantage",
  flags: { a: "advantage", adv: "advantage", d: "disadvantage", dc: "threshold", dis: "disadvantage" },
  shift: "disadvantage",
};

export const formulaCommand = { args: ["formula"], formula: true };

/**
 * Make a simple command function.
 * @param {(actor: TeriockActor) => Promise<*>} operation
 * @returns {Teriock.Command.SimpleCommandFunction}
 */
export function simpleCommandFunctionFactory(operation) {
  return async function simpleCommandFunction(actor, options = {}) {
    if (!game.actors.check(actor)) { return; }
    await operation(actor, options);
  };
}
