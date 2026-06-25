import fs from "fs";
import path from "path";

import { default as activations } from "../../src/en/activations.json" with { type: "json" };
import { default as automations } from "../../src/en/automations.json" with { type: "json" };
import { default as base } from "../../src/en/base.json" with { type: "json" };
import { default as changes } from "../../src/en/changes.json" with { type: "json" };
import { default as commands } from "../../src/en/commands.json" with { type: "json" };
import { default as compendium } from "../../src/en/compendium.json" with { type: "json" };
import { default as configs } from "../../src/en/configs.json" with { type: "json" };
import { default as costs } from "../../src/en/costs.json" with { type: "json" };
import { default as dialogs } from "../../src/en/dialogs.json" with { type: "json" };
import { default as documents } from "../../src/en/documents.json" with { type: "json" };
import { default as effects } from "../../src/en/effects.json" with { type: "json" };
import { default as elements } from "../../src/en/elements.json" with { type: "json" };
import { default as expirations } from "../../src/en/expirations.json" with { type: "json" };
import { default as fields } from "../../src/en/fields.json" with { type: "json" };
import { default as format } from "../../src/en/format.json" with { type: "json" };
import { default as macros } from "../../src/en/macros.json" with { type: "json" };
import { default as mechanics } from "../../src/en/mechanics.json" with { type: "json" };
import { default as message } from "../../src/en/message.json" with { type: "json" };
import { default as models } from "../../src/en/models.json" with { type: "json" };
import { default as packs } from "../../src/en/packs.json" with { type: "json" };
import { default as perception } from "../../src/en/perception.json" with { type: "json" };
import { default as rollContext } from "../../src/en/roll-context.json" with { type: "json" };
import { default as rolls } from "../../src/en/rolls.json" with { type: "json" };
import { default as schema } from "../../src/en/schema.json" with { type: "json" };
import { default as settings } from "../../src/en/settings.json" with { type: "json" };
import { default as sheets } from "../../src/en/sheets.json" with { type: "json" };
import { default as stats } from "../../src/en/stats.json" with { type: "json" };
import { default as statuses } from "../../src/en/statuses.json" with { type: "json" };
import { default as systems } from "../../src/en/systems.json" with { type: "json" };
import { default as terms } from "../../src/en/terms.json" with { type: "json" };
import { default as triggers } from "../../src/en/triggers.json" with { type: "json" };
import { default as classesContent } from "../../src/index/content/classes.json" with { type: "json" };
import { default as conditionsContent } from "../../src/index/content/conditions.json" with { type: "json" };
import { default as keywordsContent } from "../../src/index/content/keywords.json" with { type: "json" };
import { default as tradecraftsContent } from "../../src/index/content/tradecrafts.json" with { type: "json" };
import { default as weaponFightingStylesContent } from "../../src/index/content/weapon-fighting-styles.json" with { type: "json" };
import { default as conditions } from "../../src/index/names/conditions.json" with { type: "json" };
import * as index from "../../src/module/constants/index/_module.mjs";
import { sortObject } from "../script-utils.mjs";

/**
 * Recursively merge any number objects. This is simpler than Foundry's `mergeObject` and does not support arrays. It
 * should be used only for merging JSON language files.
 * @param {object} target
 * @param {...object} sources
 * @returns {object}
 */
function mergeObjects(target, ...sources) {
  for (const source of sources) {
    if (!source) { continue; }
    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        if (source[key] !== null && typeof source[key] === "object") {
          if (!target[key]) { target[key] = {}; }
          mergeObjects(target[key], source[key]);
        } else {
          target[key] = source[key];
        }
      }
    }
  }
  return target;
}

const DIR = path.join(".", "lang");
const DST = path.join(DIR, "en.json");
const LANG = base;

if (!fs.existsSync(DIR)) { fs.mkdirSync(DIR); }

const content = {
  TERIOCK: {
    CONTENT: {
      Classes: classesContent,
      Conditions: conditionsContent,
      Keywords: keywordsContent,
      Tradecrafts: tradecraftsContent,
      WeaponFightingStyles: weaponFightingStylesContent,
    },
  },
};

statuses.TERIOCK.STATUSES.Conditions = conditions;

Object.assign(terms.TERIOCK.TERMS, {
  Abilities: index.abilities,
  BodyParts: index.bodyParts,
  Classes: index.classes,
  Creatures: index.creatures,
  Currency: index.currency,
  DamageTypes: index.damageTypes,
  DrainTypes: index.drainTypes,
  EffectTypes: index.effectTypes,
  Elements: index.elements,
  Equipment: index.equipment,
  EquipmentClasses: index.equipmentClasses,
  PowerSources: index.powerSources,
  Properties: index.properties,
  StoneColor: index.deathBag,
  Tradecrafts: index.tradecrafts,
  Traits: index.traits,
  WeaponFightingStyles: index.weaponFightingStyles,
});

mergeObjects(
  LANG,
  activations,
  automations,
  changes,
  commands,
  compendium,
  configs,
  content,
  costs,
  dialogs,
  documents,
  effects,
  elements,
  expirations,
  fields,
  format,
  macros,
  mechanics,
  message,
  models,
  packs,
  perception,
  rollContext,
  rolls,
  schema,
  settings,
  sheets,
  stats,
  statuses,
  systems,
  terms,
  triggers,
);

await fs.promises.writeFile(DST, JSON.stringify(sortObject(LANG), null, 2), "utf-8");
