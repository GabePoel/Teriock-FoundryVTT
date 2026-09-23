import fs from "fs";
import path from "path";

import { default as activations } from "../../src/en/activations.json" with { type: "json" };
import { default as affinities } from "../../src/en/affinities.json" with { type: "json" };
import { default as automations } from "../../src/en/automations.json" with { type: "json" };
import { default as base } from "../../src/en/base.json" with { type: "json" };
import { default as changes } from "../../src/en/changes.json" with { type: "json" };
import { default as combat } from "../../src/en/combat.json" with { type: "json" };
import { default as commands } from "../../src/en/commands.json" with { type: "json" };
import { default as common } from "../../src/en/common.json" with { type: "json" };
import { default as compendium } from "../../src/en/compendium.json" with { type: "json" };
import { default as costs } from "../../src/en/costs.json" with { type: "json" };
import { default as dialogs } from "../../src/en/dialogs.json" with { type: "json" };
import { default as documents } from "../../src/en/documents.json" with { type: "json" };
import { default as effects } from "../../src/en/effects.json" with { type: "json" };
import { default as elements } from "../../src/en/elements.json" with { type: "json" };
import { default as executions } from "../../src/en/executions.json" with { type: "json" };
import { default as expirations } from "../../src/en/expirations.json" with { type: "json" };
import { default as fields } from "../../src/en/fields.json" with { type: "json" };
import { default as format } from "../../src/en/format.json" with { type: "json" };
import { default as macros } from "../../src/en/macros.json" with { type: "json" };
import { default as mechanics } from "../../src/en/mechanics.json" with { type: "json" };
import { default as menus } from "../../src/en/menus.json" with { type: "json" };
import { default as message } from "../../src/en/message.json" with { type: "json" };
import { default as models } from "../../src/en/models.json" with { type: "json" };
import { default as operations } from "../../src/en/operations.json" with { type: "json" };
import { default as packs } from "../../src/en/packs.json" with { type: "json" };
import { default as perception } from "../../src/en/perception.json" with { type: "json" };
import { default as pseudos } from "../../src/en/pseudos.json" with { type: "json" };
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
import { default as index } from "../../src/json/wiki-index.json" with { type: "json" };
import { toCamelCase } from "../../src/module/helpers/string.mjs";
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

const WIKI_TITLE_SUFFIXES = [
  " creatures",
  "ly powered abilities",
  " powered abilities",
  " effects",
  " element abilities",
  " Fighting Style",
];

/**
 * Capitalize each word the way the wiki scraper does.
 * @param {string} str
 * @returns {string}
 */
function toTitleCase(str) {
  return str.toLowerCase().replace(/(?:^|\s|-)\w/g, (match) => match.toUpperCase());
}

/**
 * Get a display name from a wiki page title.
 * @param {string} title
 * @param {boolean} titleCase
 * @returns {string}
 */
function cleanWikiPage(title, titleCase) {
  let name = title.split(":").slice(1).join(":");
  const suffix = WIKI_TITLE_SUFFIXES.find(s => name.endsWith(s));
  if (suffix) { name = name.slice(0, -suffix.length); }
  return titleCase ? toTitleCase(name) : name;
}

/**
 * Wiki index keys are identifiers so they are kebab-case. Localization keys are camelCase.
 * @param {Record<string, string>} obj
 * @param {boolean} [titleCase=false]
 * @returns {Record<string, string>}
 */
function wikiKeys(obj, titleCase = false) {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [toCamelCase(k), cleanWikiPage(v, titleCase)]));
}

statuses.TERIOCK.STATUSES.Conditions = wikiKeys(index.condition);

Object.assign(terms.TERIOCK.TERMS, {
  Classes: wikiKeys(index.class),
  EffectTypes: wikiKeys(index.effect, true),
  Elements: wikiKeys(index.element),
  EquipmentClasses: wikiKeys(index.classification, true),
  PowerSources: wikiKeys(index.source),
  Tradecrafts: wikiKeys(index.tradecraft),
  Traits: wikiKeys(index.trait),
});

mergeObjects(
  LANG,
  activations,
  affinities,
  automations,
  changes,
  combat,
  commands,
  common,
  compendium,
  costs,
  dialogs,
  documents,
  effects,
  elements,
  executions,
  expirations,
  fields,
  format,
  macros,
  mechanics,
  menus,
  message,
  models,
  operations,
  packs,
  perception,
  pseudos,
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
