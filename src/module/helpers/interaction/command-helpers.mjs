import { parsePayload } from "../../applications/ux/enrichment-helpers.mjs";

/**
 * Reformat arguments from interaction entries into an object.
 * @param {Teriock.Enrichment.Input} input
 * @param {Teriock.Command.CommandEntry} command
 * @returns {Record<string, Teriock.System.Serializable>}
 */
export function interpretCommandInput(input, command) {
  const definedArguments = command.args || [];
  const argumentOptions = {};
  for (
    let i = 0; i < Math.min(input.arguments.length, definedArguments.length); i++
  ) { argumentOptions[definedArguments[i]] = input.arguments[i]; }
  return { ...input.config, ...argumentOptions };
}

/**
 * Get a value from a specified property of a command.
 * @param {Teriock.Command.CommandEntry} interaction
 * @param {string} property
 * @param {object} options
 * @returns {string}
 */
export function getCommandEntryValue(interaction, property, options) {
  if (!interaction[property]) { return ""; }
  if (typeof interaction[property] === "string") { return interaction[property]; }
  return interaction[property](options);
}

/**
 * Build an object of options for a command from a payload string.
 * @param {string} payload
 * @param {Teriock.Command.CommandEntry} command
 * @returns {Record<string, Teriock.System.Serializable>}
 */
export function buildCommandOptions(payload, command) {
  const commandOptions = {};
  if (command.formula) { commandOptions.formula = payload; }
  else {
    Object.assign(
      commandOptions,
      interpretCommandInput(parsePayload(payload, { hasConfig: true, hasMultipleArguments: true }), command),
    );
  }
  return commandOptions;
}
