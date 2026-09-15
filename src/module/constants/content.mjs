import { default as weaponFightingStyles } from "../../json/content/weapon-fighting-styles.json" with { type: "json" };
import { preLocalizeConfig } from "../helpers/localization.mjs";

const rawContent = { weaponFightingStyles };
const content = Object.fromEntries(
  Object.entries(rawContent).map(([category, records]) => {
    const prefixedRecords = Object.fromEntries(
      Object.keys(records).map(key => [key, `TERIOCK.CONTENT.${category.capitalize()}.${key}`]),
    );
    return [category, prefixedRecords];
  }),
);
export default content;

preLocalizeConfig("content.weaponFightingStyles");
