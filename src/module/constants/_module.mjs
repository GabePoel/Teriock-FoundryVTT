import { conditions as conditionsContent } from "../content/conditions.mjs";
import { magicalProperties } from "../content/magical-properties.mjs";
import { materialProperties } from "../content/material-properties.mjs";
import {
  properties,
  properties as propertiesContent,
} from "../content/properties.mjs";
import { mergeLevel } from "../helpers/utils.mjs";
import { abilityOptions } from "./ability-options.mjs";
import { characterOptions } from "./character-options.mjs";
import { consequenceOptions } from "./consequence-options.mjs";
import { currencyOptions } from "./currency-options.mjs";
import { dieOptions } from "./die-options.mjs";
import { displayOptions } from "./display-options.mjs";
import { documentOptions } from "./document-options.mjs";
import { equipmentOptions } from "./equipment-options.mjs";
import { fonts } from "./fonts.mjs";
import { abilities } from "./generated/abilities.mjs";
import { conditions as conditionsList } from "./generated/conditions.mjs";
import { equipment } from "./generated/equipment.mjs";
import { iconStyles } from "./icon-styles.mjs";
import { icons } from "./icons.mjs";
import { powerOptions } from "./power-options.mjs";
import { pseudoHooks } from "./pseudo-hooks.mjs";
import { rankOptions } from "./rank-options.mjs";
import { resourceOptions } from "./resource-options.mjs";
import { speciesOptions } from "./species-options.mjs";
import { tradecraftOptions } from "./tradecraft-options.mjs";

const allProperties = {};
for (const [key, value] of Object.entries(properties)) {
  allProperties[key] = value.name;
}
for (const [key, value] of Object.entries(magicalProperties)) {
  allProperties[key] = value.name;
}
for (const [key, value] of Object.entries(materialProperties)) {
  allProperties[key] = value.name;
}

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
  abilities: abilities,
  properties: allProperties,
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
  rankOptionsList: mergeLevel(rankOptions, "*.classes", "name"),
  tradecraftOptions: tradecraftOptions,
  tradecraftOptionsList: mergeLevel(tradecraftOptions, "*.tradecrafts", "name"),
  tradecraftOptionsMain: {
    artisan: tradecraftOptions.artisan,
    mediator: tradecraftOptions.mediator,
    scholar: tradecraftOptions.scholar,
    survivalist: tradecraftOptions.survivalist,
  },
  resourceOptions: resourceOptions,
  speciesOptions: speciesOptions,
  dieOptions: dieOptions,
  pseudoHooks: pseudoHooks,
};
