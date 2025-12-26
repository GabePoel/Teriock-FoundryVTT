import { documentOptions } from "../../../constants/options/document-options.mjs";

/**
 * @param {TeriockActor} actor
 * @param {Teriock.Interactions.StatusOptions} options
 * @returns {Promise<void>}
 */
async function apply(actor, options = {}) {
  const status = options.status;
  if (!status) return;
  await actor.toggleStatusEffect(status, { active: true });
}

/**
 * @param {TeriockActor} actor
 * @param {Teriock.Interactions.StatusOptions} options
 * @returns {Promise<void>}
 */
async function remove(actor, options = {}) {
  const status = options.status;
  if (!status) return;
  await actor.system.removeCondition(status);
}

/**
 * @param {TeriockActor} actor
 * @param {Teriock.Interactions.StatusOptions} options
 * @returns {Promise<void>}
 */
async function toggle(actor, options = {}) {
  const status = options.status;
  if (!status) return;
  await actor.toggleStatusEffect(status);
}

/**
 * Apply status command
 * @type {Teriock.Interactions.CommandEntry}
 */
export const applyStatusCommand = {
  args: ["status"],
  icon: "plus",
  id: "apply",
  label: (options) =>
    options?.status
      ? `Apply ${TERIOCK.index.conditions[options.status]}`
      : "Apply Status",
  primary: apply,
  secondary: remove,
};

/**
 * Remove status command
 * @type {Teriock.Interactions.CommandEntry}
 */
export const removeStatusCommand = {
  args: ["status"],
  icon: "xmark",
  id: "remove",
  label: (options) =>
    options?.status
      ? `Remove ${TERIOCK.index.conditions[options.status]}`
      : "Remove Status",
  primary: remove,
  secondary: apply,
};

/**
 * Toggle status command
 * @type {Teriock.Interactions.CommandEntry}
 */
export const toggleStatusCommand = {
  args: ["status"],
  icon: documentOptions.condition.icon,
  id: "toggle",
  label: (options) =>
    options?.status
      ? `Toggle ${TERIOCK.index.conditions[options.status]}`
      : "Toggle Status",
  primary: toggle,
};
