import { mergeLevel } from "../utils.mjs";
import archetypes from "./game/classes.mjs";
import documentTypes from "./system/document-types.mjs";
import effectType from "./game/effect-type.mjs";
import fields from "./game/tradecrafts.mjs";
import hacks from "./game/hacks.mjs";
import iconStyles from "./system/icon-styles.mjs";
import money from "./game/money.mjs";
import powerLevel from "./game/power-level.mjs";
import powerTypes from "./game/power-types.mjs";
import speeds from "./game/speeds.mjs";

const classes = mergeLevel(archetypes, "*", "classes");
const tradecrafts = mergeLevel(fields, "*", "tradecrafts");
const currencies = mergeLevel(money, "*", "currencies");

export default constants = {
  game: {
    archetypes,
    classes,
    currencies,
    effectType,
    fields,
    hacks,
    powerLevel,
    powerTypes,
    speeds,
    tradecrafts,
  },
  system: {
    documentTypes,
    iconStyles,
  },
};
