/** @import TeriockAbilityData from "../ability-data.mjs"; */
import { abilityOptions } from "../../../../helpers/constants/ability-options.mjs";
import { cleanFeet } from "../../../../helpers/clean.mjs";
import { createAbility } from "../../../../helpers/create-effects.mjs";

/**
 * Cost value templates for different cost types.
 * Provides standardized cost structures for variable, static, formula, and hack costs.
 * @type {object}
 * @private
 */
const COST_TEMPLATES = {
  variable: (variable) => ({ type: "variable", value: { variable, static: 0, formula: "" } }),
  static: (value) => ({ type: "static", value: { static: value, formula: "", variable: "" } }),
  formula: (formula) => ({ type: "formula", value: { static: 0, formula, variable: "" } }),
  hack: () => ({ type: "hack", value: { static: 0, formula: "", variable: "" } }),
};

/**
 * Creates the default consequence structure for ability effects.
 * Provides empty rolls, statuses, start/end statuses, hacks, checks, and duration.
 * @returns {object} The default consequence structure.
 * @private
 */
function defaultConsequence() {
  return {
    rolls: {},
    statuses: new Set(),
    startStatuses: new Set(),
    endStatuses: new Set(),
    hacks: new Set(),
    checks: new Set(),
    duration: 0,
  };
}

/**
 * Creates the default applies structure for ability effects.
 * Provides base, proficient, fluent, and heightened effect containers.
 * @returns {object} The default applies structure with empty effect containers.
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
 * Handles tag processing, cost calculation, component parsing, and sub-ability creation.
 * @param {TeriockAbilityData} abilityData - The ability data to parse content for.
 * @param {string} rawHTML - The raw HTML content to parse.
 * @returns {Promise<{ changes: object[], system: Partial<TeriockAbilityData>, img: string }>} Promise that resolves to the parsed ability data.
 * @private
 */
export async function _parse(abilityData, rawHTML) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(rawHTML, "text/html");

  // Clean up old children
  const oldDescendants = abilityData.parent.getDescendants();
  const oldDescendantsIds = oldDescendants.map((descendant) => descendant._id);
  await abilityData.parent.parent.deleteEmbeddedDocuments("ActiveEffect", oldDescendantsIds);

  // Get sub-abilities
  const subs = Array.from(doc.querySelectorAll(".ability-sub-container")).filter(
    (el) => !el.closest(".ability-sub-container:not(:scope)"),
  );

  // Remove sub-containers and process dice
  doc.querySelectorAll(".ability-sub-container").forEach((el) => el.remove());
  doc.querySelectorAll(".dice").forEach((el) => {
    const fullRoll = el.getAttribute("data-full-roll");
    const quickRoll = el.getAttribute("data-quick-roll");
    if (quickRoll) el.textContent = `[[/roll ${fullRoll}]]`;
  });

  // Build tag tree
  const tagTree = buildTagTree(doc);

  // Initialize parameters
  const referenceAbility = new ActiveEffect({ name: "Reference Ability", type: "ability" });
  const parameters = foundry.utils.deepClone(referenceAbility.system).toObject();
  const changes = [];
  delete parameters.executionTime;
  delete parameters.maneuver;

  // Process tags and build parameters
  processTags(parameters, tagTree, doc, changes);

  // Process costs
  processCosts(parameters, tagTree, doc);

  // Process components
  processComponents(parameters, tagTree, doc);

  // Set remaining parameters
  setRemainingParameters(parameters, tagTree, doc);

  // Clean up parameters
  parameters.editable = false;
  delete parameters.improvement;
  delete parameters.limitation;
  delete parameters.parentId;
  delete parameters.childIds;

  // Process dice and effect extraction
  processDiceAndEffectExtraction(parameters);

  // Select image
  const img = selectImage(parameters);

  // Process sub-abilities
  await processSubAbilities(subs, abilityData);

  // Check if parent name contains "warded"
  if (abilityData.parent.name.toLowerCase().includes("warded")) {
    parameters.warded = true;
  }

  return { changes, system: parameters, img };
}

/**
 * Builds a tag tree from tag containers in the document.
 * Extracts and organizes tags from CSS classes for processing.
 * @param {Document} doc - The parsed HTML document.
 * @returns {object} Object containing organized tags by type.
 * @private
 */
function buildTagTree(doc) {
  const tagTree = {};
  doc.querySelectorAll(".tag-container").forEach((el) => {
    const tags = Array.from(el.classList)
      .filter((cls) => cls.endsWith("-tagged"))
      .map((cls) => cls.replace("-tagged", ""));
    if (tags.length) {
      if (tags.length === 1) tagTree[tags[0]] = true;
      else {
        tagTree[tags[0]] = tagTree[tags[0]] || [];
        tagTree[tags[0]].push(...tags.slice(1));
      }
    }
  });
  return tagTree;
}

/**
 * Helper function to get bar text content from ability bars.
 * Optionally cleans and formats the text for display.
 * @param {Document} doc - The parsed HTML document.
 * @param {string} selector - The selector for the bar content.
 * @param {boolean} clean - Whether to clean and format the text.
 * @returns {string|null} The bar text content or null if not found.
 * @private
 */
function getBarText(doc, selector, clean = false) {
  const el = doc.querySelector(`.ability-bar-${selector} .ability-bar-content`);
  let text = el?.innerHTML || null;
  if (text && clean) {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = text;
    tempDiv.querySelectorAll("span").forEach((span) => span.replaceWith(document.createTextNode(" ")));
    text = tempDiv.innerHTML
      .trim()
      .replace(/\.$/, "")
      .replace(/\./g, ",")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    text = cleanFeet(text).trim();
  }
  return text;
}

/**
 * Helper function to get text content from elements.
 * @param {Document} doc - The parsed HTML document.
 * @param {string} selector - The CSS selector for the element.
 * @returns {string|null} The text content or null if not found.
 * @private
 */
function getText(doc, selector) {
  return doc.querySelector(`.${selector}`)?.innerHTML || null;
}

/**
 * Processes tags and builds ability parameters from the tag tree.
 * Handles power sources, basic tag assignments, maneuver types, and improvements.
 * @param {object} parameters - The ability parameters to populate.
 * @param {object} tagTree - The tag tree extracted from the document.
 * @param {Document} doc - The parsed HTML document.
 * @param {Array} changes - Array to collect changes for improvements.
 * @private
 */
function processTags(parameters, tagTree, doc, changes) {
  // Power sources
  if (tagTree.power) {
    parameters.powerSources = tagTree.power;
    if (parameters.powerSources.includes("unknown") || parameters.powerSources.includes("psionic")) {
      parameters.abilityType = "special";
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

  if (tagTree.executionTime) parameters.executionTime = tagTree.executionTime[0];

  // Determine maneuver type
  if (parameters.executionTime === "passive") parameters.maneuver = "passive";
  else if (parameters.executionTime && abilityOptions.executionTime.active[parameters.executionTime]) {
    parameters.maneuver = "active";
  } else if (parameters.executionTime && abilityOptions.executionTime.reactive[parameters.executionTime]) {
    parameters.maneuver = "reactive";
  } else {
    parameters.maneuver = "slow";
  }

  // Normalize execution time
  if (parameters.executionTime === "shortRest") parameters.executionTime = "Short Rest";
  if (parameters.executionTime === "longRest") parameters.executionTime = "Long Rest";
  if (!parameters.executionTime) {
    const executionTime = getBarText(doc, "execution-time", true) || getBarText(doc, "casting-time", true);
    parameters.executionTime = executionTime;
  }

  // Set basic parameters
  parameters.duration = getBarText(doc, "duration", true);
  parameters.range = getBarText(doc, "range", true);
  if (parameters.delivery.base === "self") parameters.range = "Self.";

  if (tagTree.sustained) parameters.sustained = true;

  // Overview and results
  parameters.overview.base = getText(doc, "ability-overview-base");
  parameters.overview.proficient = getBarText(doc, "if-proficient");
  parameters.overview.fluent = getBarText(doc, "if-fluent");

  const resultBars = ["hit", "critHit", "miss", "critMiss", "save", "critSave", "fail", "critFail"];
  const resultsBars = {
    hit: "on-hit",
    critHit: "on-critical-hit",
    miss: "on-miss",
    critMiss: "on-critical-miss",
    save: "on-save",
    critSave: "on-critical-save",
    fail: "on-fail",
    critFail: "on-critical-fail",
  };
  resultBars.forEach((bar) => {
    parameters.results[bar] = getBarText(doc, resultsBars[bar]);
  });

  // Process improvements
  processImprovements(parameters, doc, changes);

  // Other tags
  if (tagTree.skill) parameters.skill = true;
  if (tagTree.spell) parameters.spell = true;
  if (tagTree.standard) parameters.standard = true;
  if (tagTree.rotator) {
    parameters.rotator = true;
    parameters.abilityType = "special";
  }
  if (tagTree.deliveryPackage?.includes("ritual")) parameters.ritual = true;
  if (tagTree.flaw) parameters.abilityType = "flaw";

  if (doc.querySelector(".ability-basic")) {
    parameters.basic = true;
    parameters.abilityType = "intrinsic";
  }
}

/**
 * Processes improvements from the document and adds them to parameters.
 * Handles attribute improvements and feat save improvements.
 * @param {object} parameters - The ability parameters to populate.
 * @param {Document} doc - The parsed HTML document.
 * @param {Array} changes - Array to collect changes for improvements.
 * @private
 */
function processImprovements(parameters, doc, changes) {
  // Attribute improvement
  const attrImp = doc.querySelector(".ability-bar-attribute-improvement");
  if (attrImp) {
    const flags = Array.from(attrImp.classList).filter((cls) => cls.startsWith("flag-"));
    const attr = flags.find((cls) => cls.startsWith("flag-attribute-"))?.replace("flag-attribute-", "");
    const minVal = flags.find((cls) => cls.startsWith("flag-value-"))?.replace("flag-value-", "");
    parameters.improvements.attributeImprovement.attribute = attr;
    parameters.improvements.attributeImprovement.minVal = minVal ? parseInt(minVal, 10) : null;
    changes.push({
      key: `system.attributes.${attr}.value`,
      mode: 4,
      value: minVal,
      priority: 20,
    });
  }

  // Feat save improvement
  const featImp = doc.querySelector(".ability-bar-feat-save-improvement");
  if (featImp) {
    const flags = Array.from(featImp.classList).filter((cls) => cls.startsWith("flag-"));
    const attr = flags.find((cls) => cls.startsWith("flag-attribute-"))?.replace("flag-attribute-", "");
    const amount = flags.find((cls) => cls.startsWith("flag-value-"))?.replace("flag-value-", "");
    parameters.improvements.featSaveImprovement.attribute = attr;
    parameters.improvements.featSaveImprovement.amount = amount;
    const toggle = amount === "fluency" ? "Fluent" : amount === "proficiency" ? "Proficient" : null;
    changes.push({
      key: `system.attributes.${attr}.save${toggle}`,
      mode: 4,
      value: true,
      priority: 20,
    });
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
        parameters.costs.mp = COST_TEMPLATES.variable(getBarText(doc, "mana-cost"));
      } else if (mp && !isNaN(mp)) {
        parameters.costs.mp = COST_TEMPLATES.static(parseInt(mp, 10));
      } else {
        parameters.costs.mp = COST_TEMPLATES.formula(mp || "");
      }
    }

    if (c.startsWith("hp")) {
      const hp = c.slice(2);
      if (hp === "x") {
        parameters.costs.hp = COST_TEMPLATES.variable(getBarText(doc, "hit-cost"));
      } else if (hp.toLowerCase().includes("hack")) {
        parameters.costs.hp = COST_TEMPLATES.hack();
      } else if (hp && !isNaN(hp)) {
        parameters.costs.hp = COST_TEMPLATES.static(parseInt(hp, 10));
      } else {
        parameters.costs.hp = COST_TEMPLATES.formula(hp || "");
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
  tempDiv.querySelectorAll("span.metadata[data-type='condition']").forEach((el) => {
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
  tempDiv.querySelectorAll("span.metadata[data-type='start-condition']").forEach((el) => {
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
  tempDiv.querySelectorAll("span.metadata[data-type='end-condition']").forEach((el) => {
    const condition = el.dataset.condition;
    if (condition) {
      endConditions.add(condition);
    }
  });
  return endConditions;
}

/**
 * Extracts tradecraft check information from HTML content.
 * Finds tradecraft-check metadata elements and extracts their tradecraft types.
 * @param {string} html - The HTML content to extract tradecraft checks from.
 * @returns {Set} Set of tradecraft checks found in the content.
 * @private
 */
function extractTradecraftChecksFromHTML(html) {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html || "";
  const checks = new Set();
  tempDiv.querySelectorAll("span.metadata[data-type='tradecraft-check']").forEach((el) => {
    const tradecraft = el.dataset.tradecraft;
    if (tradecraft) {
      checks.add(tradecraft);
    }
  });
  return checks;
}

/**
 * Extracts changes from HTML content.
 * Finds change metadata elements and extracts their key, mode, value, and priority.
 * @param {string} html - The HTML content to extract changes from.
 * @returns {Array} Array of change objects with key, mode, value, and priority.
 * @private
 */
function extractChangesFromHTML(html) {
  console.log(html);
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html || "";
  const changes = [];
  tempDiv.querySelectorAll("span.metadata[data-type='change']").forEach((el) => {
    const key = el.dataset.key;
    const mode = el.dataset.mode;
    const value = el.dataset.value;
    const priority = el.dataset.priority;
    console.log(el);
    console.log(key, mode, value, priority);
    if (key && mode !== undefined && value !== undefined) {
      changes.push({
        key,
        mode: parseInt(mode, 10),
        value: value === "true" ? true : value === "false" ? false : value,
        priority: priority ? parseInt(priority, 10) : 20,
      });
    }
  });
  console.log(changes);
  return changes;
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
    { source: parameters.overview.proficient, target: parameters.applies.proficient },
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
      target.startStatuses = new Set([...(target.startStatuses || []), ...startConditions]);
    }

    const endConditions = extractEndConditionsFromHTML(source);
    if (endConditions.size > 0) {
      target.endStatuses = new Set([...(target.endStatuses || []), ...endConditions]);
    }

    const tradecraftChecks = extractTradecraftChecksFromHTML(source);
    if (tradecraftChecks.size > 0) {
      target.checks = new Set([...(target.checks || []), ...tradecraftChecks]);
    }

    const changes = extractChangesFromHTML(source);
    if (changes.length > 0) {
      target.changes = [...(target.changes || []), ...changes];
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

  // Process all result types for tradecraft checks and other metadata
  const resultTypes = ["hit", "critHit", "miss", "critMiss", "save", "critSave", "fail", "critFail"];
  resultTypes.forEach((resultType) => {
    if (parameters.results[resultType]) {
      Object.assign(resultDice, extractDiceFromHTML(parameters.results[resultType]));
      const currentHacks = extractHacksFromHTML(parameters.results[resultType]);
      const currentConditions = extractConditionsFromHTML(parameters.results[resultType]);
      const currentStartConditions = extractStartConditionsFromHTML(parameters.results[resultType]);
      const currentEndConditions = extractEndConditionsFromHTML(parameters.results[resultType]);
      const currentTradecraftChecks = extractTradecraftChecksFromHTML(parameters.results[resultType]);
      const currentChanges = extractChangesFromHTML(parameters.results[resultType]);

      // Merge all results
      resultHacks = new Set([...resultHacks, ...currentHacks]);
      resultConditions = new Set([...resultConditions, ...currentConditions]);
      resultStartConditions = new Set([...resultStartConditions, ...currentStartConditions]);
      resultEndConditions = new Set([...resultEndConditions, ...currentEndConditions]);
      resultTradecraftChecks = new Set([...resultTradecraftChecks, ...currentTradecraftChecks]);
      resultChanges = [...resultChanges, ...currentChanges];
    }
  });

  if (Object.keys(resultDice).length) {
    Object.assign(parameters.applies.base.rolls, resultDice);
  }

  if (resultHacks.size > 0) {
    parameters.applies.base.hacks = new Set([...(parameters.applies.base.hacks || []), ...resultHacks]);
  }

  if (resultConditions.size > 0) {
    parameters.applies.base.statuses = new Set([...(parameters.applies.base.statuses || []), ...resultConditions]);
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
    parameters.applies.base.checks = new Set([...(parameters.applies.base.checks || []), ...resultTradecraftChecks]);
  }

  if (resultChanges.length > 0) {
    parameters.applies.base.changes = [...(parameters.applies.base.changes || []), ...resultChanges];
  }
}

/**
 * Selects the appropriate image for the ability based on its parameters.
 * Chooses between spell, skill, class-specific, or default ability icons.
 * @param {object} parameters - The ability parameters to determine the image from.
 * @returns {string} The path to the selected image.
 * @private
 */
function selectImage(parameters) {
  let img = "systems/teriock/assets/ability.svg";
  if (parameters.spell) img = "systems/teriock/assets/spell.svg";
  else if (parameters.skill) img = "systems/teriock/assets/skill.svg";
  if (parameters.class) img = `systems/teriock/assets/classes/${parameters.class}.svg`;
  return img;
}

/**
 * Processes sub-abilities from the document.
 * Creates sub-abilities and applies limitations or improvements as needed.
 * @param {Array} subs - Array of sub-ability container elements.
 * @param {TeriockAbilityData} abilityData - The parent ability data.
 * @returns {Promise<void>} Promise that resolves when all sub-abilities are processed.
 * @private
 */
async function processSubAbilities(subs, abilityData) {
  for (const el of subs) {
    const subNameEl = el.querySelector(".ability-sub-name");
    const namespace = subNameEl?.getAttribute("data-namespace");
    if (namespace === "Ability") {
      const subName = subNameEl.getAttribute("data-name");
      const subAbility = await createAbility(abilityData.parent, subName, { notify: false });

      const limitation = el.querySelector(".limited-modifier");
      const improvement = el.querySelector(".improvement-modifier");
      let limitationText = "";
      let improvementText = "";
      let newName = subName;

      if (improvement) {
        newName = "Improved " + subName;
        const improvementSpan = improvement.querySelector(".improvement-text");
        if (improvementSpan) {
          improvementText = improvementSpan.textContent.trim();
        }
      }

      if (limitation) {
        newName = "Limited " + newName;
        const limitationSpan = limitation.querySelector(".limitation-text");
        if (limitationSpan) {
          limitationText = limitationSpan.textContent.trim();
        }
      }

      if (limitationText || improvementText) {
        await subAbility.update({
          name: newName,
          "system.improvement": improvementText,
          "system.limitation": limitationText,
        });
      }
    }
  }
}
