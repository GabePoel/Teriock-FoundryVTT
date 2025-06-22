import { abilities } from "./constants/generated/abilities.mjs";
import { abilityOptions } from "./constants/ability-options.mjs";
import { characterOptions } from "./constants/character-options.mjs";
import { conditions as conditionsContent } from "../content/conditions.mjs";
import { conditions as conditionsList } from "./constants/generated/conditions.mjs";
import { consequenceOptions } from "./constants/consequence-options.mjs";
import { currencyOptions } from "./constants/currency-options.mjs";
import { displayOptions } from "./constants/display-options.mjs";
import { documentOptions } from "./constants/document-options.mjs";
import { equipment } from "./constants/generated/equipment.mjs";
import { equipmentOptions } from "./constants/equipment-options.mjs";
import { fonts } from "./constants/fonts.mjs";
import { icons } from "./constants/icons.mjs";
import { iconStyles } from "./constants/icon-styles.mjs";
import { magicalProperties } from "../content/magical-properties.mjs";
import { materialProperties } from "../content/material-properties.mjs";
import { powerOptions } from "./constants/power-options.mjs";
import { properties as propertiesContent } from "../content/properties.mjs";
import { rankOptions } from "./constants/rank-options.mjs";
import { resourceOptions } from "./constants/resource-options.mjs";
import { tradecraftOptions } from "./constants/tradecraft-options.mjs";
import * as fields from "../data/effect-data/ability-data/methods/schema/_define-consequences.mjs";

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
  equipment: equipment,
  equipmentOptions: equipmentOptions,
  fonts: fonts,
  icons: icons,
  iconStyles: iconStyles,
  powerOptions: powerOptions,
  rankOptions: rankOptions,
  tradecraftOptions: tradecraftOptions,
  tradecraftOptionsMain: {
    artisan: tradecraftOptions.artisan,
    mediator: tradecraftOptions.mediator,
    scholar: tradecraftOptions.scholar,
    survivalist: tradecraftOptions.survivalist,
  },
  resourceOptions: resourceOptions,
  fields: fields,
};

export default TERIOCK;
