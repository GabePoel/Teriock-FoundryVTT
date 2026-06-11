import { icons } from "../../../constants/display/icons.mjs";
import { validateTypedIdentifier } from "../../../data/fields/helpers/validators.mjs";

/**
 * Make a status command function.
 * @param {(actor: TeriockActor, status: Teriock.Keys.Status) => Promise<*>} operation
 * @returns {Teriock.Command.SimpleCommandFunction<Teriock.Command.StatusOptions>}
 */
function fnFactory(operation) {
  return async function statusCommandFunction(a, o) {
    if (game.actors.check(a) && o?.status) { await operation(a, o.status); }
  };
}

const apply = fnFactory((a, s) =>
  validateTypedIdentifier(s, { strict: true })
    ? a.toggleChild(s, { active: true })
    : a.toggleStatusEffect(s, { active: true })
);
const remove = fnFactory((a, s) =>
  validateTypedIdentifier(s, { strict: true }) ? a.toggleChild(s, { active: false }) : a.system.removeCondition(s)
);
const toggle = fnFactory((a, s) =>
  validateTypedIdentifier(s, { strict: true }) ? a.toggleChild(s) : a.toggleStatusEffect(s)
);

/**
 * Apply status command
 * @type {Teriock.Command.CommandEntry}
 */
export const applyStatusCommand = {
  args: ["status"],
  icon: icons.ui.apply,
  id: "apply",
  primary: apply,
  secondary: remove,
  label: options => options?.status
    ? _loc("TERIOCK.COMMANDS.Status.applyNamed", { name: TERIOCK.reference.conditions[options.status] })
    : _loc("TERIOCK.COMMANDS.Status.applyUnnamed"),
};

/**
 * Remove status command
 * @type {Teriock.Command.CommandEntry}
 */
export const removeStatusCommand = {
  args: ["status"],
  icon: icons.ui.undo,
  id: "remove",
  primary: remove,
  secondary: apply,
  label: options => options?.status
    ? _loc("TERIOCK.COMMANDS.Status.removeNamed", { name: TERIOCK.reference.conditions[options.status] })
    : _loc("TERIOCK.COMMANDS.Status.removeUnnamed"),
};

/**
 * Toggle status command
 * @type {Teriock.Command.CommandEntry}
 */
export const toggleStatusCommand = {
  args: ["status"],
  icon: icons.ui.toggle,
  id: "toggle",
  primary: toggle,
  label: options => options?.status
    ? _loc("TERIOCK.COMMANDS.Status.toggleNamed", { name: TERIOCK.reference.conditions[options.status] })
    : _loc("TERIOCK.COMMANDS.Status.toggleUnnamed"),
};
