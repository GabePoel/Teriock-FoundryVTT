import * as content from "./content/_module.mjs";
import * as display from "./display/_module.mjs";
import * as index from "./index/_module.mjs";
import * as options from "./options/_module.mjs";
import * as system from "./system/_module.mjs";

/**
 * Main configuration object containing all system options, constants, and content.
 *
 * This object consolidates all configuration data from various constant files and content modules,
 * providing a centralized access point for system-wide settings and options.
 *
 * @type {Object}
 * @property {Object} abilities - Generated abilities data
 * @property {Object} abilityOptions - Ability configuration options
 * @property {Object} characterOptions - Character configuration options
 * @property {Array} conditions - List of available conditions
 * @property {Object} content - Content objects for conditions, properties, etc.
 * @property {Object} consequenceOptions - Consequence configuration options
 * @property {Object} currencyOptions - Currency configuration options
 * @property {Object} displayOptions - Display configuration options
 * @property {Object} documentOptions - Document configuration options
 * @property {Object} equipmentType - Generated equipment types
 * @property {Object} equipmentOptions - Equipment configuration options
 * @property {Object} fonts - Font configuration options
 * @property {Object} icons - Icon configuration options
 * @property {Object} iconStyles - Icon style configuration options
 * @property {Object} powerOptions - Power configuration options
 * @property {Object} rankOptions - Rank configuration options
 * @property {Object} tradecraftOptions - Tradecraft configuration options
 * @property {Array} tradecraftOptionsList - Flattened list of tradecraft names
 * @property {Object} tradecraftOptionsMain - Main tradecraft categories
 * @property {Object} resourceOptions - Resource configuration options
 */
export const TERIOCK = {
  index: index,
  content: content,
  options: options,
  system: system,
  display: display,
};
