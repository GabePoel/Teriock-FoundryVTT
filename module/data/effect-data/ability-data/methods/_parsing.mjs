/** @import TeriockAbilityData from "../ability-data.mjs"; */
import { _override } from "./_overrides.mjs";
import { abilityOptions } from "../../../../helpers/constants/ability-options.mjs";
import { cleanFeet } from "../../../../helpers/clean.mjs";
import { createAbility } from "../../../../helpers/create-effects.mjs";

// Cost value templates
const COST_TEMPLATES = {
  variable: (variable) => ({ type: "variable", value: { variable, static: 0, formula: "" } }),
  static: (value) => ({ type: "static", value: { static: value, formula: "", variable: "" } }),
  formula: (formula) => ({ type: "formula", value: { static: 0, formula, variable: "" } }),
  hack: () => ({ type: "hack", value: { static: 0, formula: "", variable: "" } }),
};

// Default applies structure
const DEFAULT_APPLIES = {
  base: {
    rolls: {},
    statuses: new Set(),
    startStatuses: new Set(),
    endStatuses: new Set(),
    hacks: new Set(),
    checks: new Set(),
    duration: 0,
    changes: [],
  },
  proficient: {
    rolls: {},
    statuses: new Set(),
    startStatuses: new Set(),
    endStatuses: new Set(),
    hacks: new Set(),
    checks: new Set(),
    duration: 0,
    changes: [],
  },
  fluent: {
    rolls: {},
    statuses: new Set(),
    startStatuses: new Set(),
    endStatuses: new Set(),
    hacks: new Set(),
    checks: new Set(),
    duration: 0,
    changes: [],
  },
  heightened: {
    rolls: {},
    statuses: new Set(),
    startStatuses: new Set(),
    endStatuses: new Set(),
    hacks: new Set(),
    checks: new Set(),
    duration: 0,
    changes: [],
  },
};

/**
 * @param {TeriockAbilityData} abilityData
 * @param {string} rawHTML
 * @returns {Promise<{ changes: object[], system: Partial<TeriockAbilityData>, img: string }>}
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

  // Apply overrides
  const applications = _override(abilityData.parent.name);
  if (applications) parameters.applies = applications;

  // Select image
  const img = selectImage(parameters);

  // Process sub-abilities
  await processSubAbilities(subs, abilityData);

  return { changes, system: parameters, img };
}

/**
 * Build tag tree from tag containers
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
 * Helper to get bar text
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
 * Helper to get text content
 */
function getText(doc, selector) {
  return doc.querySelector(`.${selector}`)?.innerHTML || null;
}

/**
 * Process tags and build parameters
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
 * Process improvements
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
 * Process costs
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
 * Process components
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
 * Set remaining parameters
 */
function setRemainingParameters(parameters, tagTree, doc) {
  parameters.endCondition = getBarText(doc, "end-condition");
  parameters.requirements = getBarText(doc, "requirements");
  if (tagTree.effect) parameters.effects = tagTree.effect;
  parameters.heightened = getBarText(doc, "heightened");
  parameters.expansionRange = getBarText(doc, "expansion-range", true);
  parameters.trigger = getBarText(doc, "trigger");
}

/**
 * Extract dice from HTML content
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
 * Extract hacks from HTML content
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
 * Extract conditions from HTML content
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
 * Extract start conditions from HTML content
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
 * Extract end conditions from HTML content
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
 * Process dice and effect extraction
 */
function processDiceAndEffectExtraction(parameters) {
  // Initialize applies if needed
  if (!parameters.applies) {
    parameters.applies = { ...DEFAULT_APPLIES };
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
  });

  // Extract dice and effects from results
  let resultDice = {};
  let resultHacks = new Set();
  let resultConditions = new Set();
  let resultStartConditions = new Set();
  let resultEndConditions = new Set();
  let resultTradecraftChecks = new Set();

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

      // Merge all results
      resultHacks = new Set([...resultHacks, ...currentHacks]);
      resultConditions = new Set([...resultConditions, ...currentConditions]);
      resultStartConditions = new Set([...resultStartConditions, ...currentStartConditions]);
      resultEndConditions = new Set([...resultEndConditions, ...currentEndConditions]);
      resultTradecraftChecks = new Set([...resultTradecraftChecks, ...currentTradecraftChecks]);
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
}

/**
 * Select image based on parameters
 */
function selectImage(parameters) {
  let img = "systems/teriock/assets/ability.svg";
  if (parameters.spell) img = "systems/teriock/assets/spell.svg";
  else if (parameters.skill) img = "systems/teriock/assets/skill.svg";
  if (parameters.class) img = `systems/teriock/assets/classes/${parameters.class}.svg`;
  return img;
}

/**
 * Process sub-abilities
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
