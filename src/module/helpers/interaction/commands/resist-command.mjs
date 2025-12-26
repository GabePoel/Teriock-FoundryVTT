import { thresholdCommand } from "./abstract-command.mjs";

/**
 * @param {TeriockActor} actor
 * @param {Teriock.Interactions.ResistOptions} options
 * @returns {Promise<void>}
 */
async function primary(actor, options = {}) {
  await actor.system.rollResistance(options);
}

/**
 * Resist command
 * @type {Teriock.Interactions.CommandEntry}
 */
const command = {
  ...thresholdCommand,
  icon: "shield-alt",
  id: "resist",
  label: (options) => `Roll ${options?.hex ? "Hexproof" : "Resistance"}`,
  primary,
};

export default command;
