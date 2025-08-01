import { conditions as conditionsContent } from "../content/conditions.mjs";
import { magicalProperties } from "../content/magical-properties.mjs";
import { materialProperties } from "../content/material-properties.mjs";
import { properties as propertiesContent } from "../content/properties.mjs";
import { abilityOptions } from "./constants/ability-options.mjs";
import { characterOptions } from "./constants/character-options.mjs";
import { consequenceOptions } from "./constants/consequence-options.mjs";
import { currencyOptions } from "./constants/currency-options.mjs";
import { displayOptions } from "./constants/display-options.mjs";
import { documentOptions } from "./constants/document-options.mjs";
import { equipmentOptions } from "./constants/equipment-options.mjs";
import { fonts } from "./constants/fonts.mjs";
import { abilities } from "./constants/generated/abilities.mjs";
import { conditions as conditionsList } from "./constants/generated/conditions.mjs";
import { equipment } from "./constants/generated/equipment.mjs";
import { iconStyles } from "./constants/icon-styles.mjs";
import { icons } from "./constants/icons.mjs";
import { powerOptions } from "./constants/power-options.mjs";
import { pseudoHooks } from "./constants/pseudo-hooks.mjs";
import { rankOptions } from "./constants/rank-options.mjs";
import { resourceOptions } from "./constants/resource-options.mjs";
import { tradecraftOptions } from "./constants/tradecraft-options.mjs";
import { mergeLevel } from "./utils.mjs";

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
const TERIOCK = {
  abilities: abilities,
  abilityOptions: abilityOptions,
  characterOptions: characterOptions,
  conditions: conditionsList,
  content: {
    conditions: conditionsContent,
    properties: propertiesContent,
    materialProperties: materialProperties,
    magicalProperties: magicalProperties,
  },
  consequenceOptions: consequenceOptions,
  currencyOptions: currencyOptions,
  displayOptions: displayOptions,
  documentOptions: documentOptions,
  equipmentType: equipment,
  equipmentOptions: equipmentOptions,
  fonts: fonts,
  icons: icons,
  iconStyles: iconStyles,
  powerOptions: powerOptions,
  rankOptions: rankOptions,
  tradecraftOptions: tradecraftOptions,
  tradecraftOptionsList: mergeLevel(tradecraftOptions, "*.tradecrafts", "name"),
  tradecraftOptionsMain: {
    artisan: tradecraftOptions.artisan,
    mediator: tradecraftOptions.mediator,
    scholar: tradecraftOptions.scholar,
    survivalist: tradecraftOptions.survivalist,
  },
  resourceOptions: resourceOptions,
  pseudoHooks: pseudoHooks,
};

export default TERIOCK;
