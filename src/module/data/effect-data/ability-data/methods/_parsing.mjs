import { abilityOptions } from "../../../../constants/options/ability-options.mjs";
import { getIcon } from "../../../../helpers/path.mjs";
import { parseDurationString, safeUuid } from "../../../../helpers/utils.mjs";
import { cleanHTMLDoc, cleanObject } from "../../../shared/parsing/clean-html-doc.mjs";
import { extractChangesFromHTML } from "../../../shared/parsing/extract-changes.mjs";
import { getBarText, getText } from "../../../shared/parsing/get-text.mjs";
import { processSubAbilities } from "../../../shared/parsing/process-subs.mjs";
import { buildTagTree } from "../../../shared/parsing/tag-tree.mjs";

/**
 * Cost value templates for different cost types.
 * Provides standardized cost structures for variable, static, formula, and hack costs.
 * @type {object}
 * @private
 */
const COST_TEMPLATES = Object.freeze({
  variable: (variable) => ({
    type: "variable",
    value: { variable, static: 0, formula: "" },
  }),
  static: (value) => ({
    type: "static",
    value: { static: value, formula: "", variable: "" },
  }),
  formula: (formula) => ({
    type: "formula",
    value: { static: 0, formula, variable: "" },
  }),
  hack: () => ({
    type: "hack",
    value: { static: 0, formula: "", variable: "" },
  }),
});

/**
 * Creates the default consequence structure for ability effects.
 * Provides empty rolls, statuses, start/end statuses, hacks, checks, and duration.
 * @returns {AbilityConsequence} The default consequence structure.
 * @private
 */
function defaultConsequence() {
  return {
    changes: [],
    checks: new Set(),
    common: new Set(),
    duration: 0,
    endStatuses: new Set(),
    expiration: {
      normal: null,
      crit: null,
      changeOnCrit: false,
      doesExpire: false,
    },
    hacks: new Set(),
    rolls:
    /** @type {Record<Teriock.Parameters.Consequence.RollConsequenceKey, string>} */ {},
    startStatuses: new Set(),
    statuses: new Set(),
  };
}

/**
 * Creates the default applies structure for ability effects.
 * Provides base, proficient, fluent, and heightened consequence fields.
 * @returns {object} The default applies structure with empty consequence fields.
 * @private
 */
function defaultApplies() {
  return {
    base: defaultConsequence(),
    proficient: defaultConsequence(),
    fluent: defaultConsequence(),
    heightened: defaultConsequence(),
  };
}

/**
 * Parses raw HTML content for an ability, extracting properties and creating effects.
 * Handles tag processing, cost calculation, component parsing, and subability creation.
 * @param {TeriockAbilityData} abilityData - The ability data to parse content for.
 * @param {string} rawHTML - The raw HTML content to parse.
 * @returns {Promise<{ changes: object[], system: Partial<TeriockAbilityData>, img: string }>} Promise that resolves to
 *   the parsed ability data.
 * @private
 */
export async function _parse(abilityData, rawHTML) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(rawHTML, "text/html");

  // Clean up old subs
  // await abilityData.parent.deleteSubs();

  // Get new subs
  const subs = Array.from(
    doc.querySelectorAll(".ability-sub-container"),
  ).filter((el) => !el.closest(".ability-sub-container:not(:scope)"));
  const expandableSubs = Array.from(
    doc.querySelectorAll(".expandable-container"),
  ).filter((el) => !el.closest(".expandable-container:not(:scope)"));
  subs.push(...expandableSubs);

  // Remove sub-containers and process dice
  cleanHTMLDoc(doc);

  // Build the tag tree
  const tagTree = buildTagTree(doc);

  // Initialize parameters
  const referenceAbility = new ActiveEffect({
    name: "Reference Ability",
    type: "ability",
  });
  const parameters = foundry.utils
    .deepClone(referenceAbility.system)
    .toObject();
  const changes = [];
  delete parameters.applies;
  delete parameters.executionTime;
  delete parameters.maneuver;
  delete parameters.hierarchy.rootUuid;
  delete parameters.proficient;
  delete parameters.fluent;

  // Process tags and build parameters
  processTags(parameters, tagTree, doc, changes);

  // Process costs
  processCosts(parameters, tagTree, doc);

  // Process components
  processComponents(parameters, tagTree, doc);

  // Set remaining parameters
  setRemainingParameters(parameters, tagTree, doc);

  // Clean parameters
  delete parameters.improvement;
  delete parameters.limitation;
  delete parameters.hierarchy.supId;
  delete parameters.hierarchy.subIds;

  // Process dice and effect extraction
  processDiceAndEffectExtraction(parameters);

  // Add macro if appropriate
  parameters.applies.macros = extractMacroFromHTML(doc);

  // Process sub-abilities
  await processSubAbilities(subs, abilityData.parent);

  // Check if the parent name contains "warded"
  if (abilityData.parent.name.toLowerCase().includes("warded")) {
    parameters.warded = true;
  }
  const img = getIcon("abilities", abilityData.parent.name);

  delete parameters.results.endCondition;

  const toClean = [
    "elderSorceryIncant",
    "overview.base",
    "overview.proficient",
    "overview.fluent",
    "results.hit",
    "results.critHit",
    "results.miss",
    "results.critMiss",
    "results.save",
    "results.critSave",
    "results.fail",
    "results.critFail",
    "costs.mp.value.variable",
    "costs.hp.value.variable",
    "costs.gp.value.variable",
    "costs.materialCost",
    "heightened",
    "endCondition",
    "requirements",
    "trigger",
    "limitation",
    "improvement",
  ];
  cleanObject(parameters, toClean);

  return { changes, system: parameters, img };
}

/**
 * Processes tags and builds ability parameters from the tag tree.
 * Handles power sources, basic tag assignments, maneuver types, and improvements.
 * @param {object} parameters - The ability parameters to populate.
 * @param {Record<string, string[]>} tagTree - The tag tree extracted from the document.
 * @param {Document} doc - The parsed HTML document.
 * @private
 */
function processTags(parameters, tagTree, doc) {
  // Power sources
  if (tagTree.power) {
    parameters.powerSources = tagTree.power;
    if (
      parameters.powerSources.includes("unknown") ||
      parameters.powerSources.includes("psionic")
    ) {
      parameters.form = "special";
    }
  }

  // Basic tag assignments
  const tagAssignments = {
    interaction: tagTree.interaction?.[0],
    featSaveAttribute: tagTree.saveAttribute?.[0],
    "delivery.base": tagTree.delivery?.[0],
    "delivery.package": tagTree.deliveryPackage?.[0],
    targets: tagTree.target,
    elements: tagTree.element,
    piercing: tagTree.piercing?.[0],
    expansion: tagTree.expansion?.[0],
    expansionSaveAttribute: tagTree.expansionAttribute?.[0],
    class: tagTree.class?.[0],
  };

  Object.entries(tagAssignments).forEach(([key, value]) => {
    if (value) {
      const keys = key.split(".");
      if (keys.length === 1) {
        parameters[key] = value;
      } else {
        parameters[keys[0]][keys[1]] = value;
      }
    }
  });

  // Maneuver and execution time
  if (tagTree.maneuver) {
    parameters.maneuver = tagTree.maneuver[0];
    if (parameters.maneuver === "passive") parameters.executionTime = "passive";
  }

  if (tagTree.executionTime)
    parameters.executionTime = tagTree.executionTime[0];

  // Determine maneuver type
  if (parameters.executionTime === "passive") parameters.maneuver = "passive";
  else if (
    parameters.executionTime &&
    abilityOptions.executionTime.active[parameters.executionTime]
  ) {
    parameters.maneuver = "active";
  } else if (
    parameters.executionTime &&
    abilityOptions.executionTime.reactive[parameters.executionTime]
  ) {
    parameters.maneuver = "reactive";
  } else {
    parameters.maneuver = "slow";
  }

  // Normalize execution time
  if (parameters.executionTime === "shortRest")
    parameters.executionTime = "Short Rest";
  if (parameters.executionTime === "longRest")
    parameters.executionTime = "Long Rest";
  if (!parameters.executionTime) {
    parameters.executionTime =
      getBarText(doc, "execution-time", true) ||
      getBarText(doc, "casting-time", true);
  }

  // Set basic parameters
  const durationDescription = getBarText(doc, "duration", true);
  parameters.duration = parseDurationString(durationDescription);
  parameters.range = getBarText(doc, "range", true);
  if (parameters.delivery.base === "self") parameters.range = "Self.";

  if (tagTree.sustained) parameters.sustained = true;

  // Overview and results
  parameters.overview.base = getText(doc, "ability-overview-base");
  parameters.overview.proficient = getBarText(doc, "if-proficient");
  parameters.overview.fluent = getBarText(doc, "if-fluent");

  // Add endCondition results bar to be removed later
  parameters.results["endCondition"] = "";

  const resultBars = [
    "hit",
    "critHit",
    "miss",
    "critMiss",
    "save",
    "critSave",
    "fail",
    "critFail",
    "endCondition",
  ];
  const resultsBars = {
    hit: ["on-hit"],
    critHit: ["on-critical-hit"],
    miss: ["on-miss"],
    critMiss: ["on-critical-miss"],
    save: ["on-save", "on-success"],
    critSave: ["on-critical-save"],
    fail: ["on-fail"],
    critFail: ["on-critical-fail"],
    endCondition: ["end-condition"],
  };
  resultBars.forEach((bar) => {
    let result;
    for (const resultsBarOption of resultsBars[bar]) {
      if (!result) {
        result = getBarText(doc, resultsBarOption);
      }
    }
    parameters.results[bar] = result;
  });

  // Process improvements
  processImprovements(parameters, doc);

  // Other tags
  if (tagTree.skill) parameters.skill = true;
  if (tagTree.spell) parameters.spell = true;
  if (tagTree.standard) parameters.standard = true;
  if (tagTree.rotator) {
    parameters.rotator = true;
    parameters.form = "special";
  }
  if (tagTree.deliveryPackage?.includes("ritual")) parameters.ritual = true;
  if (tagTree.special) parameters.form = "special";
  if (tagTree.flaw) parameters.form = "flaw";

  if (doc.querySelector(".ability-basic")) {
    parameters.basic = true;
    parameters.form = "intrinsic";
  }
}

/**
 * Processes improvements from the document and adds them to parameters.
 * Handles attribute improvements and feat save improvements.
 * @param {object} parameters - The ability parameters to populate.
 * @param {Document} doc - The parsed HTML document.
 * @private
 */
function processImprovements(parameters, doc) {
  // Attribute improvement
  const attrImp = doc.querySelector(".ability-bar-attribute-improvement");
  if (attrImp) {
    const flags = Array.from(attrImp.classList).filter((cls) =>
      cls.startsWith("flag-"),
    );
    const attr = flags
      .find((cls) => cls.startsWith("flag-attribute-"))
      ?.replace("flag-attribute-", "");
    const minVal = flags
      .find((cls) => cls.startsWith("flag-value-"))
      ?.replace("flag-value-", "");
    parameters.improvements.attributeImprovement.attribute = attr;
    parameters.improvements.attributeImprovement.minVal = minVal
      ? parseInt(minVal, 10)
      : null;
    if (minVal < 0) {
      parameters.form = "flaw";
    }
    if (minVal > 3) {
      parameters.form = "special";
    }
  }

  // Feat save improvement
  const featImp = doc.querySelector(".ability-bar-feat-save-improvement");
  if (featImp) {
    const flags = Array.from(featImp.classList).filter((cls) =>
      cls.startsWith("flag-"),
    );
    const attr = flags
      .find((cls) => cls.startsWith("flag-attribute-"))
      ?.replace("flag-attribute-", "");
    const amount = flags
      .find((cls) => cls.startsWith("flag-value-"))
      ?.replace("flag-value-", "");
    parameters.improvements.featSaveImprovement.attribute = attr;
    parameters.improvements.featSaveImprovement.amount = amount;
  }
}

/**
 * Processes costs from the tag tree and document.
 * Handles MP, HP, and break costs using cost templates.
 * @param {object} parameters - The ability parameters to populate.
 * @param {object} tagTree - The tag tree extracted from the document.
 * @param {Document} doc - The parsed HTML document.
 * @private
 */
function processCosts(parameters, tagTree, doc) {
  if (!tagTree.cost) return;

  tagTree.cost.forEach((c) => {
    if (c.startsWith("mp")) {
      const mp = c.slice(2);
      if (mp === "x") {
        parameters.costs.mp = COST_TEMPLATES.variable(
          getBarText(doc, "mana-cost"),
        );
      } else if (mp && !isNaN(mp)) {
        parameters.costs.mp = COST_TEMPLATES.static(parseInt(mp, 10));
      } else {
        parameters.costs.mp = COST_TEMPLATES.formula(mp || "");
      }
    }

    if (c.startsWith("hp")) {
      const hp = c.slice(2);
      if (hp === "x") {
        parameters.costs.hp = COST_TEMPLATES.variable(
          getBarText(doc, "hit-cost"),
        );
      } else if (hp.toLowerCase().includes("hack")) {
        parameters.costs.hp = COST_TEMPLATES.hack();
      } else if (hp && !isNaN(hp)) {
        parameters.costs.hp = COST_TEMPLATES.static(parseInt(hp, 10));
      } else {
        parameters.costs.hp = COST_TEMPLATES.formula(hp || "");
      }
    }

    if (c.startsWith("gp")) {
      const gp = c.slice(2);
      if (gp === "x") {
        parameters.costs.gp = COST_TEMPLATES.variable(
          getBarText(doc, "gold-cost"),
        );
      } else if (gp && !isNaN(gp)) {
        parameters.costs.gp = COST_TEMPLATES.static(parseInt(gp, 10));
      } else {
        parameters.costs.gp = COST_TEMPLATES.formula(gp || "");
      }
    }

    if (c === "shatter") parameters.costs.break = "shatter";
    if (c === "destroy") parameters.costs.break = "destroy";
  });
}

/**
 * Processes components from the tag tree and document.
 * Handles invoked, verbal, somatic, and material components.
 * @param {object} parameters - The ability parameters to populate.
 * @param {object} tagTree - The tag tree extracted from the document.
 * @param {Document} doc - The parsed HTML document.
 * @private
 */
function processComponents(parameters, tagTree, doc) {
  if (!tagTree.component) return;

  tagTree.component.forEach((c) => {
    if (c === "invoked") parameters.costs.invoked = true;
    if (c === "verbal") parameters.costs.verbal = true;
    if (c === "somatic") parameters.costs.somatic = true;
    if (c === "material") {
      parameters.costs.material = true;
      parameters.costs.materialCost = getBarText(doc, "material-cost");
    }
  });
}

/**
 * Sets remaining parameters from the tag tree and document.
 * Handles end conditions, requirements, effects, expansion range, triggers, and heightened effects.
 * @param {object} parameters - The ability parameters to populate.
 * @param {object} tagTree - The tag tree extracted from the document.
 * @param {Document} doc - The parsed HTML document.
 * @private
 */
function setRemainingParameters(parameters, tagTree, doc) {
  parameters.endCondition = getBarText(doc, "end-condition");
  parameters.requirements = getBarText(doc, "requirements");
  if (tagTree.effect) parameters.effects = tagTree.effect;
  parameters.expansionRange = getBarText(doc, "expansion-range", true);
  parameters.trigger = getBarText(doc, "trigger");
  parameters.heightened = getBarText(doc, "heightened");
}

/**
 * Extracts dice information from HTML content.
 * Finds dice elements and extracts their type and roll formula.
 * @param {string} html - The HTML content to extract dice from.
 * @returns {object} Object containing dice types and their roll formulas.
 * @private
 */
function extractDiceFromHTML(html) {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html || "";
  const dice = {};
  tempDiv.querySelectorAll(".dice").forEach((el) => {
    if (!(el instanceof HTMLElement)) return;
    const type = el.dataset.type;
    const fullRoll = el.dataset.fullRoll;
    if (type && type !== "none" && fullRoll) {
      dice[type] = fullRoll;
    }
  });
  return dice;
}

/**
 * Extracts hack information from HTML content.
 * Finds hack metadata elements and extracts their parts.
 * @param {string} html - The HTML content to extract hacks from.
 * @returns {Set} Set of hack parts found in the content.
 * @private
 */
function extractHacksFromHTML(html) {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html || "";
  const hacks = new Set();
  tempDiv.querySelectorAll("span.metadata[data-type='hack']").forEach((el) => {
    if (!(el instanceof HTMLElement)) return;
    const part = el.dataset.part;
    if (part) {
      hacks.add(part);
    }
  });
  return hacks;
}

/**
 * Extracts condition information from HTML content.
 * Finds condition metadata elements and extracts their conditions.
 * @param {string} html - The HTML content to extract conditions from.
 * @returns {Set} Set of conditions found in the content.
 * @private
 */
function extractConditionsFromHTML(html) {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html || "";
  const conditions = new Set();
  tempDiv
    .querySelectorAll("span.metadata[data-type='condition']")
    .forEach((el) => {
      if (!(el instanceof HTMLElement)) return;
      const condition = el.dataset.condition;
      if (condition) {
        conditions.add(condition);
      }
    });
  return conditions;
}

/**
 * Extracts start condition information from HTML content.
 * Finds start-condition metadata elements and extracts their conditions.
 * @param {string} html - The HTML content to extract start conditions from.
 * @returns {Set} Set of start conditions found in the content.
 * @private
 */
function extractStartConditionsFromHTML(html) {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html || "";
  const startConditions = new Set();
  tempDiv
    .querySelectorAll("span.metadata[data-type='start-condition']")
    .forEach((el) => {
      if (!(el instanceof HTMLElement)) return;
      const condition = el.dataset.condition;
      if (condition) {
        startConditions.add(condition);
      }
    });
  return startConditions;
}

/**
 * Extracts end condition information from HTML content.
 * Finds end-condition metadata elements and extracts their conditions.
 * @param {string} html - The HTML content to extract end conditions from.
 * @returns {Set} Set of end conditions found in the content.
 * @private
 */
function extractEndConditionsFromHTML(html) {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html || "";
  const endConditions = new Set();
  tempDiv
    .querySelectorAll("span.metadata[data-type='end-condition']")
    .forEach((el) => {
      if (!(el instanceof HTMLElement)) return;
      const condition = el.dataset.condition;
      if (condition) {
        endConditions.add(condition);
      }
    });
  return endConditions;
}

/**
 * Extracts tradecraft check information from HTML content.
 * Find tradecraft-check metadata elements and extract their tradecraft types.
 * @param {string} html - The HTML content to extract tradecraft checks from.
 * @returns {Set} Set of tradecraft checks found in the content.
 * @private
 */
function extractTradecraftChecksFromHTML(html) {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html || "";
  const checks = new Set();
  tempDiv
    .querySelectorAll("span.metadata[data-type='tradecraft-check']")
    .forEach((el) => {
      if (!(el instanceof HTMLElement)) return;
      const tradecraft = el.dataset.tradecraft;
      if (tradecraft) {
        checks.add(tradecraft);
      }
    });
  return checks;
}

/**
 * Extracts standard damage from HTML content.
 * @param {string} html - The HTML content to extract standard damage from.
 * @returns {boolean} - Whether standard damage is dealt.
 */
function extractStandardDamageFromHTML(html) {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html || "";
  let standardDamage = false;
  tempDiv
    .querySelectorAll("span.metadata[data-type='standard-damage']")
    .forEach(() => {
      standardDamage = true;
    });
  return standardDamage;
}

/**
 * Extracts duration from HTML content. Finds duration metadata elements and extracts its number of seconds.
 * @param html - The HTML content to extract changes from.
 * @returns {number} Number of seconds.
 * @private
 */
function extractDurationFromHTML(html) {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html || "";
  const el = tempDiv.querySelector("span.metadata[data-type='duration']");
  if (!(el instanceof HTMLElement)) return 0;
  return Number(el.dataset.seconds);
}

/**
 * Extracts macro from raw document content.
 * @param doc - The raw document content to extract macro from.
 * @returns {Record<Teriock.SafeUUID<TeriockMacro>, string>} The macro name.
 */
function extractMacroFromHTML(doc) {
  const elements = doc.querySelectorAll("span.metadata[data-type='macro']");
  const macroAssignments = {};
  for (const /** @type {HTMLElement} */ el of elements) {
    if (el instanceof HTMLElement && el.dataset.name) {
      const macroName = el.dataset.name;
      const pseudoHook = el.dataset.pseudoHook;
      if (macroName && pseudoHook) {
        try {
          const executionPack = game.teriock.packs.execution();
          const macroUuid = executionPack?.index.getName(macroName).uuid;
          if (macroUuid) {
            const macroSafeUuid = safeUuid(macroUuid);
            macroAssignments[macroSafeUuid] = pseudoHook;
          }
        } catch {
        }
      }
    }
  }
  return macroAssignments;
}

/**
 /**
 * Extracts combat expiration information from HTML content.
 * Finds combat-expiration metadata elements and extracts their configuration.
 * @param {string} html - The HTML content to extract combat expiration from.
 * @returns {object|null} Combat expiration object or null if not found.
 * @private
 */
function extractCombatExpirationFromHTML(html) {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html || "";
  const elements = tempDiv.querySelectorAll(
    "span.metadata[data-type='combat-expiration']",
  );

  for (const /** @type {HTMLElement} */ el of elements) {
    if (el instanceof HTMLElement && el.dataset.whoType) {
      return {
        combat: {
          who: {
            type: el.dataset.whoType || "target",
          },
          what: {
            type: el.dataset.whatType || "rolled",
            roll: el.dataset.whatRoll || "2d4kh1",
            threshold: el.dataset.whatThreshold
              ? parseInt(el.dataset.whatThreshold, 10)
              : 4,
          },
          when: {
            time: el.dataset.whenTime || "start",
            trigger: el.dataset.whenTrigger || "turn",
            skip: el.dataset.whenSkip ? parseInt(el.dataset.whenSkip, 10) : 0,
          },
        },
      };
    }
  }
  return null;
}

/**
 * Processes dice and effect extraction from ability parameters.
 * Extracts dice, hacks, conditions, and changes from overviews and results.
 * @param {object} parameters - The ability parameters to process.
 * @private
 */
function processDiceAndEffectExtraction(parameters) {
  // Initialize applies if needed
  if (!parameters.applies) {
    parameters.applies = defaultApplies();
  }

  // Extract dice and effects from overviews
  const overviewSources = [
    { source: parameters.overview.base, target: parameters.applies.base },
    {
      source: parameters.overview.proficient,
      target: parameters.applies.proficient,
    },
    { source: parameters.overview.fluent, target: parameters.applies.fluent },
    { source: parameters.heightened, target: parameters.applies.heightened },
  ];

  overviewSources.forEach(({ source, target }) => {
    const dice = extractDiceFromHTML(source);
    if (Object.keys(dice).length) {
      Object.assign(target.rolls, dice);
    }
    const hacks = extractHacksFromHTML(source);
    if (hacks.size > 0) {
      target.hacks = new Set([...(target.hacks || []), ...hacks]);
    }

    const conditions = extractConditionsFromHTML(source);
    if (conditions.size > 0) {
      target.statuses = new Set([...(target.statuses || []), ...conditions]);
    }

    const startConditions = extractStartConditionsFromHTML(source);
    if (startConditions.size > 0) {
      target.startStatuses = new Set([
        ...(target.startStatuses || []),
        ...startConditions,
      ]);
    }

    const endConditions = extractEndConditionsFromHTML(source);
    if (endConditions.size > 0) {
      target.endStatuses = new Set([
        ...(target.endStatuses || []),
        ...endConditions,
      ]);
    }

    const tradecraftChecks = extractTradecraftChecksFromHTML(source);
    if (tradecraftChecks.size > 0) {
      target.checks = new Set([...(target.checks || []), ...tradecraftChecks]);
    }

    const changes = extractChangesFromHTML(source);
    if (changes.length > 0) {
      target.changes = [...(target.changes || []), ...changes];
    }

    const standardDamage = extractStandardDamageFromHTML(source);
    if (standardDamage) {
      target.standardDamage = standardDamage;
    }

    const duration = extractDurationFromHTML(source);
    if (duration > 0) {
      target.duration = duration;
    }

    // Extract combat expiration metadata
    const combatExpiration = extractCombatExpirationFromHTML(source);
    if (combatExpiration) {
      target.expiration.normal = combatExpiration;
      target.expiration.doesExpire = true;
    }
  });

  // Extract dice and effects from results
  let resultDice = {};
  let resultHacks = new Set();
  let resultConditions = new Set();
  let resultStartConditions = new Set();
  let resultEndConditions = new Set();
  let resultTradecraftChecks = new Set();
  let resultChanges = [];
  let resultDuration = 0;
  let resultStandardDamage = false;
  let normalExpiration = null;
  let critExpiration = null;

  // Define which result types are considered "crit"
  const critResultTypes = ["critHit", "critSave", "critMiss", "critFail"];
  const normalResultTypes = ["hit", "save", "miss", "fail", "endCondition"];

  // Process all result types for tradecraft checks and other metadata
  const resultTypes = [
    "hit",
    "critHit",
    "miss",
    "critMiss",
    "save",
    "critSave",
    "fail",
    "critFail",
    "endCondition",
  ];
  resultTypes.forEach((resultType) => {
    if (parameters.results[resultType]) {
      Object.assign(
        resultDice,
        extractDiceFromHTML(parameters.results[resultType]),
      );
      const currentHacks = extractHacksFromHTML(parameters.results[resultType]);
      const currentConditions = extractConditionsFromHTML(
        parameters.results[resultType],
      );
      const currentStartConditions = extractStartConditionsFromHTML(
        parameters.results[resultType],
      );
      const currentEndConditions = extractEndConditionsFromHTML(
        parameters.results[resultType],
      );
      const currentTradecraftChecks = extractTradecraftChecksFromHTML(
        parameters.results[resultType],
      );
      const currentChanges = extractChangesFromHTML(
        parameters.results[resultType],
      );
      const currentDuration = extractDurationFromHTML(
        parameters.results[resultType],
      );
      const currentStandardDamage = extractStandardDamageFromHTML(
        parameters.results[resultType],
      );
      const currentCombatExpiration = extractCombatExpirationFromHTML(
        parameters.results[resultType],
      );

      // Merge all results
      if (resultType !== "endCondition") {
        resultHacks = new Set([...resultHacks, ...currentHacks]);
        resultConditions = new Set([...resultConditions, ...currentConditions]);
        resultStartConditions = new Set([
          ...resultStartConditions,
          ...currentStartConditions,
        ]);
        resultEndConditions = new Set([
          ...resultEndConditions,
          ...currentEndConditions,
        ]);
        resultTradecraftChecks = new Set([
          ...resultTradecraftChecks,
          ...currentTradecraftChecks,
        ]);
        resultChanges = [...resultChanges, ...currentChanges];
        resultDuration = Math.max(resultDuration, currentDuration);
        resultStandardDamage = resultStandardDamage || currentStandardDamage;
      }

      // Handle combat expiration based on the result type
      if (currentCombatExpiration) {
        if (critResultTypes.includes(resultType)) {
          critExpiration = currentCombatExpiration;
        } else if (normalResultTypes.includes(resultType)) {
          normalExpiration = currentCombatExpiration;
        }
      }
    }
  });

  if (Object.keys(resultDice).length) {
    Object.assign(parameters.applies.base.rolls, resultDice);
  }

  if (resultHacks.size > 0) {
    parameters.applies.base.hacks = new Set([
      ...(parameters.applies.base.hacks || []),
      ...resultHacks,
    ]);
  }

  if (resultConditions.size > 0) {
    parameters.applies.base.statuses = new Set([
      ...(parameters.applies.base.statuses || []),
      ...resultConditions,
    ]);
  }

  if (resultStartConditions.size > 0) {
    parameters.applies.base.startStatuses = new Set([
      ...(parameters.applies.base.startStatuses || []),
      ...resultStartConditions,
    ]);
  }

  if (resultEndConditions.size > 0) {
    parameters.applies.base.endStatuses = new Set([
      ...(parameters.applies.base.endStatuses || []),
      ...resultEndConditions,
    ]);
  }

  if (resultTradecraftChecks.size > 0) {
    parameters.applies.base.checks = new Set([
      ...(parameters.applies.base.checks || []),
      ...resultTradecraftChecks,
    ]);
  }

  if (resultChanges.length > 0) {
    parameters.applies.base.changes = [
      ...(parameters.applies.base.changes || []),
      ...resultChanges,
    ];
  }

  if (resultStandardDamage) {
    parameters.applies.base.common.add("standardDamage");
  }

  // Apply combat expiration results
  if (normalExpiration || critExpiration) {
    if (normalExpiration) {
      parameters.applies.base.expiration.normal = normalExpiration;
      parameters.applies.base.expiration.doesExpire = true;
    }
    if (critExpiration) {
      parameters.applies.base.expiration.crit = critExpiration;
      parameters.applies.base.expiration.changeOnCrit = true;
      parameters.applies.base.expiration.doesExpire = true;
    }
  }
}
