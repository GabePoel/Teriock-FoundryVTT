import { icons } from "./constants/icons.mjs";
import { fonts } from "./constants/fonts.mjs";
import { iconStyles } from "./constants/icon-styles.mjs";
import { abilityOptions } from "./constants/ability-options.mjs";
import { tradecraftOptions } from "./constants/tradecraft-options.mjs";
import { rankOptions } from "./constants/rank-options.mjs";
import { displayOptions } from "./constants/display-options.mjs";
import { powerOptions } from "./constants/power-options.mjs";
import { equipmentOptions } from "./constants/equipment-options.mjs";
import { documentOptions } from "./constants/document-options.mjs";
import { characterOptions } from "./constants/character-options.mjs";
import { currencyOptions } from "./constants/currency-options.mjs";
import { abilities } from "./constants/generated/abilities.mjs";
import { equipment } from "./constants/generated/equipment.mjs";
import { conditions as conditionsList } from "./constants/generated/conditions.mjs";
import { conditions as conditionsContent } from "../content/conditions.mjs";
import { properties as propertiesContent } from "../content/properties.mjs";
import { materialProperties } from "../content/material-properties.mjs";
import { magicalProperties } from "../content/magical-properties.mjs";

export const TERIOCK = {
  icons: icons,
  fonts: fonts,
  iconStyles: iconStyles,
  abilityOptions: abilityOptions,
  tradecraftOptions: tradecraftOptions,
  tradecraftOptionsMain: {
    artisan: tradecraftOptions.artisan,
    mediator: tradecraftOptions.mediator,
    scholar: tradecraftOptions.scholar,
    survivalist: tradecraftOptions.survivalist,
  },
  rankOptions: rankOptions,
  displayOptions: displayOptions,
  powerOptions: powerOptions,
  equipmentOptions: equipmentOptions,
  documentOptions: documentOptions,
  characterOptions: characterOptions,
  currencyOptions: currencyOptions,
  abilities: abilities,
  equipment: equipment,
  conditions: conditionsList,
  content: {
    conditions: conditionsContent,
    properties: propertiesContent,
    materialProperties: materialProperties,
    magicalProperties: magicalProperties,
  },
}