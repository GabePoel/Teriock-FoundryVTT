import { icons } from "../../../constants/display/icons.mjs";

/**
 * Make a status command function.
 * @param {(actor: TeriockActor, status: Teriock.Keys.Status) => Promise<*>} operation
 * @returns {Teriock.Interaction.SimpleCommandFunction<Teriock.Interaction.StatusOptions>}
 */
function statusCommandFunctionFactory(operation) {
  return async function statusCommandFunction(actor, options) {
    if (!game.actors.check(actor)) return;
    const status = options.status;
    if (!status) return;
    await operation(actor, status);
  };
}

const apply = statusCommandFunctionFactory((a, s) =>
  a.toggleStatusEffect(s, { active: true }),
);
const remove = statusCommandFunctionFactory((a, s) =>
  a.system.removeCondition(s),
);
const toggle = statusCommandFunctionFactory((a, s) => a.toggleStatusEffect(s));

/**
 * Apply status command
 * @type {Teriock.Interaction.CommandEntry}
 */
export const applyStatusCommand = {
  args: ["status"],
  icon: icons.ui.apply,
  id: "apply",
  label: (options) =>
    options?.status
      ? _loc("TERIOCK.COMMANDS.Status.applyNamed", {
          name: TERIOCK.reference.conditions[options.status],
        })
      : _loc("TERIOCK.COMMANDS.Status.applyUnnamed"),
  primary: apply,
  secondary: remove,
};

/**
 * Remove status command
 * @type {Teriock.Interaction.CommandEntry}
 */
export const removeStatusCommand = {
  args: ["status"],
  icon: icons.ui.undo,
  id: "remove",
  label: (options) =>
    options?.status
      ? _loc("TERIOCK.COMMANDS.Status.removeNamed", {
          name: TERIOCK.reference.conditions[options.status],
        })
      : _loc("TERIOCK.COMMANDS.Status.removeUnnamed"),
  primary: remove,
  secondary: apply,
};

/**
 * Toggle status command
 * @type {Teriock.Interaction.CommandEntry}
 */
export const toggleStatusCommand = {
  args: ["status"],
  icon: icons.ui.toggle,
  id: "toggle",
  label: (options) =>
    options?.status
      ? _loc("TERIOCK.COMMANDS.Status.toggleNamed", {
          name: TERIOCK.index.conditions[options.status],
        })
      : _loc("TERIOCK.COMMANDS.Status.toggleUnnamed"),
  primary: toggle,
};
