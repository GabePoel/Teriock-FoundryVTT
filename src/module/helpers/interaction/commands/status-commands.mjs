import { icons } from "../../../constants/display/icons.mjs";

/**
 * @param {TeriockActor} actor
 * @param {Teriock.Interaction.StatusOptions} options
 * @returns {Promise<void>}
 */
async function apply(actor, options = {}) {
  const status = options.status;
  if (!status) return;
  await actor.toggleStatusEffect(status, { active: true });
}

/**
 * @param {TeriockActor} actor
 * @param {Teriock.Interaction.StatusOptions} options
 * @returns {Promise<void>}
 */
async function remove(actor, options = {}) {
  const status = options.status;
  if (!status) return;
  await actor.system.removeCondition(status);
}

/**
 * @param {TeriockActor} actor
 * @param {Teriock.Interaction.StatusOptions} options
 * @returns {Promise<void>}
 */
async function toggle(actor, options = {}) {
  const status = options.status;
  if (!status) return;
  await actor.toggleStatusEffect(status);
}

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
      ? game.i18n.format("TERIOCK.COMMANDS.Status.applyNamed", {
          name: TERIOCK.reference.conditions[options.status],
        })
      : game.i18n.localize("TERIOCK.COMMANDS.Status.applyUnnamed"),
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
      ? game.i18n.format("TERIOCK.COMMANDS.Status.removeNamed", {
          name: TERIOCK.reference.conditions[options.status],
        })
      : game.i18n.localize("TERIOCK.COMMANDS.Status.removeUnnamed"),
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
      ? game.i18n.format("TERIOCK.COMMANDS.Status.toggleNamed", {
          name: TERIOCK.index.conditions[options.status],
        })
      : game.i18n.localize("TERIOCK.COMMANDS.Status.toggleUnnamed"),
  primary: toggle,
};
