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
 * @param {Teriock.Command.CommandEntry} entry
 * @param {string} property
 * @param {object} options
 * @returns {string}
 */
export function getCommandEntryValue(entry, property, options) {
  if (!entry[property]) { return ""; }
  if (typeof entry[property] === "string") { return entry[property]; }
  return entry[property](options);
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
