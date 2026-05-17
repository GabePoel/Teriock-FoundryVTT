export const thresholdCommand = {
  flags: {
    a: "advantage",
    d: "disadvantage",
    adv: "advantage",
    dis: "disadvantage",
    dc: "threshold",
  },
  alt: "advantage",
  shift: "disadvantage",
};

export const formulaCommand = {
  args: ["formula"],
  formula: true,
};

/**
 * Make a simple command function.
 * @param {(actor: TeriockActor) => Promise<*>} operation
 * @returns {Teriock.Interaction.SimpleCommandFunction}
 */
export function simpleCommandFunctionFactory(operation) {
  return async function simpleCommandFunction(actor, options = {}) {
    if (!game.actors.check(actor)) {
      return;
    }
    await operation(actor, options);
  };
}
