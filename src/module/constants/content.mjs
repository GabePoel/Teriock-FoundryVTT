import { default as classes } from "../../json/content/classes.json" with { type: "json" };
import { default as conditions } from "../../json/content/conditions.json" with { type: "json" };
import { default as keywords } from "../../json/content/keywords.json" with { type: "json" };
import { default as tradecrafts } from "../../json/content/tradecrafts.json" with { type: "json" };
import { default as weaponFightingStyles } from "../../json/content/weapon-fighting-styles.json" with { type: "json" };
import { preLocalizeConfig } from "../helpers/localization.mjs";

const rawContent = { classes, conditions, keywords, tradecrafts, weaponFightingStyles };
const content = Object.fromEntries(
  Object.entries(rawContent).map(([category, records]) => {
    const prefixedRecords = Object.fromEntries(
      Object.keys(records).map(key => [key, `TERIOCK.CONTENT.${category.capitalize()}.${key}`]),
    );
    return [category, prefixedRecords];
  }),
);
export default content;

preLocalizeConfig("content.conditions");
preLocalizeConfig("content.classes");
preLocalizeConfig("content.keywords");
preLocalizeConfig("content.tradecrafts");
preLocalizeConfig("content.weaponFightingStyles");
