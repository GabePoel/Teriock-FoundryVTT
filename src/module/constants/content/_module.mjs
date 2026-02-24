import { default as classes } from "../../../index/content/classes.json" with { type: "json" };
import { default as conditions } from "../../../index/content/conditions.json" with { type: "json" };
import { default as keywords } from "../../../index/content/keywords.json" with { type: "json" };
import { default as tradecrafts } from "../../../index/content/tradecrafts.json" with { type: "json" };
import { default as weaponFightingStyles } from "../../../index/content/weapon-fighting-styles.json" with { type: "json" };
import { preLocalize } from "../../helpers/localization.mjs";
import { ucFirst } from "../../helpers/string.mjs";

const rawContent = {
  conditions,
  classes,
  keywords,
  tradecrafts,
  weaponFightingStyles,
};
const content = Object.fromEntries(
  Object.entries(rawContent).map(([category, records]) => {
    const prefixedRecords = Object.fromEntries(
      Object.keys(records).map((key) => [
        key,
        `TERIOCK.CONTENT.${ucFirst(category)}.${key}`,
      ]),
    );
    return [category, prefixedRecords];
  }),
);
export default content;

preLocalize("content.conditions");
preLocalize("content.classes");
preLocalize("content.keywords");
preLocalize("content.tradecrafts");
preLocalize("content.weaponFightingStyles");
