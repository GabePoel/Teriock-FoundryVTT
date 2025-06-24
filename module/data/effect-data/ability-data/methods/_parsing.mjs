/** @import TeriockAbilityData from "../ability-data.mjs"; */
import { cleanFeet } from "../../../../helpers/clean.mjs";
import { createAbility } from "../../../../helpers/create-effects.mjs";
import { _override } from "./_overrides.mjs";

/**
 * @param {TeriockAbilityData} abilityData
 * @param {string} rawHTML
 * @returns {Promise<{ changes: object[], system: Partial<TeriockAbilityData>, img: string }>}
 * @private
 */
export async function _parse(abilityData, rawHTML) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(rawHTML, "text/html");

  console.log("Parsing ability:", abilityData.parent.name);

  // Get children
  const oldChildren = abilityData.parent.getChildren();
  for (const child of oldChildren) {
    if (child) {
      await child.delete();
    }
  }

  console.log("Getting children for ability:", abilityData.parent.name);
  const subs = Array.from(doc.querySelectorAll(".ability-sub-container")).filter(
    (el) => !el.closest(".ability-sub-container:not(:scope)"),
  );
  console.log("Subs", subs);
  console.log("All potential subs", doc.querySelectorAll(".ability-sub-container"));

  // Remove unnecessary elements
  doc.querySelectorAll(".ability-sub-container").forEach((el) => el.remove());

  // Replace dice elements with roll syntax
  doc.querySelectorAll(".dice").forEach((el) => {
    const fullRoll = el.getAttribute("data-full-roll");
    const quickRoll = el.getAttribute("data-quick-roll");
    if (quickRoll) el.textContent = `[[/roll ${fullRoll}]]`;
  });

  // Build tag tree from tag containers
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

  console.log("Tag tree:", tagTree);

  // Helper functions
  function getBarText(selector, clean = false) {
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
  const getText = (selector) => doc.querySelector(`.${selector}`)?.innerHTML || null;

  // Clone reference ability system
  const referenceAbility = new ActiveEffect({ name: "Reference Ability", type: "ability" });
  const parameters = foundry.utils.deepClone(referenceAbility.system).toObject();
  const changes = [];
  delete parameters.executionTime;
  delete parameters.maneuver;

  // Tag-driven assignments
  if (tagTree.power) {
    parameters.powerSources = tagTree.power;
    if (parameters.powerSources.includes("unknown") || parameters.powerSources.includes("psionic"))
      parameters.abilityType = "special";
  }
  if (tagTree.interaction) parameters.interaction = tagTree.interaction[0];
  if (tagTree.saveAttribute) parameters.featSaveAttribute = tagTree.saveAttribute[0];
  if (tagTree.maneuver) {
    parameters.maneuver = tagTree.maneuver[0];
    if (parameters.maneuver === "passive") parameters.executionTime = "passive";
  }
  if (!parameters.executionTime && tagTree.executionTime) parameters.executionTime = tagTree.executionTime[0];

  // Determine maneuver type
  if (parameters.executionTime === "passive") parameters.maneuver = "passive";
  else if (parameters.executionTime && CONFIG.TERIOCK.abilityOptions.executionTime.active[parameters.executionTime])
    parameters.maneuver = "active";
  else if (parameters.executionTime && CONFIG.TERIOCK.abilityOptions.executionTime.reactive[parameters.executionTime])
    parameters.maneuver = "reactive";
  else parameters.maneuver = "slow";

  // Normalize execution time
  if (parameters.executionTime === "shortRest") parameters.executionTime = "Short Rest";
  if (parameters.executionTime === "longRest") parameters.executionTime = "Long Rest";
  if (!parameters.executionTime)
    parameters.executionTime = getBarText("execution-time", true) || getBarText("casting-time", true);

  if (tagTree.delivery) parameters.delivery.base = tagTree.delivery[0];
  if (tagTree.deliveryPackage) parameters.delivery.package = tagTree.deliveryPackage[0];
  if (tagTree.target) parameters.targets = tagTree.target;
  if (tagTree.element) parameters.elements = tagTree.element;
  parameters.duration = getBarText("duration", true);
  if (tagTree.sustained) parameters.sustained = true;
  parameters.range = getBarText("range", true);
  if (parameters.delivery.base === "self") parameters.range = "Self.";
  parameters.overview.base = getText("ability-overview-base");
  parameters.overview.proficient = getBarText("if-proficient");
  parameters.overview.fluent = getBarText("if-fluent");
  parameters.results.hit = getBarText("on-hit");
  parameters.results.critHit = getBarText("on-critical-hit");
  parameters.results.miss = getBarText("on-miss");
  parameters.results.critMiss = getBarText("on-critical-miss");
  parameters.results.save = getBarText("on-success");
  parameters.results.critSave = getBarText("on-critical-success");
  parameters.results.fail = getBarText("on-fail");
  parameters.results.critFail = getBarText("on-critical-fail");
  if (tagTree.piercing) parameters.piercing = tagTree.piercing[0];

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
    let toggle = amount === "fluency" ? "Fluent" : amount === "proficiency" ? "Proficient" : null;
    changes.push({
      key: `system.attributes.${attr}.save${toggle}`,
      mode: 4,
      value: true,
      priority: 20,
    });
  }

  // Other tags
  if (tagTree.skill) parameters.skill = true;
  if (tagTree.spell) parameters.spell = true;
  if (tagTree.standard) parameters.standard = true;
  if (tagTree.rotator) {
    parameters.rotator = true;
    parameters.abilityType = "special";
  }
  if (tagTree.deliveryPackage?.includes("ritual")) parameters.ritual = true;

  // Costs
  if (tagTree.cost) {
    for (const c of tagTree.cost) {
      if (c.startsWith("mp")) {
        const mp = c.slice(2);
        if (mp === "x") {
          parameters.costs.mp = {
            type: "variable",
            value: {
              variable: getBarText("mana-cost"),
              static: 0,
              formula: "",
            },
          };
        } else if (mp && !isNaN(mp)) {
          parameters.costs.mp = {
            type: "static",
            value: {
              static: parseInt(mp, 10),
              formula: "",
              variable: "",
            },
          };
        } else {
          parameters.costs.mp = {
            type: "formula",
            value: {
              static: 0,
              formula: mp || "",
              variable: "",
            },
          };
        }
      }
      if (c.startsWith("hp")) {
        const hp = c.slice(2);
        if (hp === "x") {
          parameters.costs.hp = {
            type: "variable",
            value: {
              variable: getBarText("hit-cost"),
              static: 0,
              formula: "",
            },
          };
        } else if (hp.toLowerCase().includes("hack")) {
          parameters.costs.hp = {
            type: "hack",
            value: {
              static: 0,
              formula: "",
              variable: "",
            },
          };
        } else if (hp && !isNaN(hp)) {
          parameters.costs.hp = {
            type: "static",
            value: {
              static: parseInt(hp, 10),
              formula: "",
              variable: "",
            },
          };
        } else {
          parameters.costs.hp = {
            type: "formula",
            value: {
              static: 0,
              formula: hp || "",
              variable: "",
            },
          };
        }
      }
      if (c === "shatter") parameters.costs.break = "shatter";
      if (c === "destroy") parameters.costs.break = "destroy";
    }
  }

  // Components
  if (tagTree.component) {
    for (const c of tagTree.component) {
      if (c === "invoked") parameters.costs.invoked = true;
      if (c === "verbal") parameters.costs.verbal = true;
      if (c === "somatic") parameters.costs.somatic = true;
      if (c === "material") {
        parameters.costs.material = true;
        parameters.costs.materialCost = getBarText("material-cost");
      }
    }
  }

  parameters.endCondition = getBarText("end-condition");
  parameters.requirements = getBarText("requirements");
  if (tagTree.effect) parameters.effects = tagTree.effect;
  parameters.heightened = getBarText("heightened");
  if (tagTree.expansion) parameters.expansion = tagTree.expansion[0];
  parameters.expansionRange = getBarText("expansion-range", true);
  if (tagTree.expansionAttribute) parameters.expansionSaveAttribute = tagTree.expansionAttribute[0];
  parameters.trigger = getBarText("trigger");
  if (tagTree.class) parameters.class = tagTree.class[0];
  if (tagTree.flaw) parameters.abilityType = "flaw";

  if (doc.querySelector(".ability-basic")) {
    parameters.basic = true;
    parameters.abilityType = "intrinsic";
  }

  parameters.editable = false;

  delete parameters.improvement;
  delete parameters.limitation;
  delete parameters.parentId;
  delete parameters.childIds;

  // --- Dice extraction for applies fields ---
  // Helper to extract dice info from HTML content
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

  // Ensure applies exists and is initialized
  if (!parameters.applies) {
    parameters.applies = {
      base: { rolls: {}, statuses: [], hacks: {}, duration: 0, changes: [] },
      proficient: { rolls: {}, statuses: [], hacks: {}, duration: 0, changes: [] },
      fluent: { rolls: {}, statuses: [], hacks: {}, duration: 0, changes: [] },
      heightened: { rolls: {}, statuses: [], hacks: {}, duration: 0, changes: [] },
    };
  }

  // Extract dice from overviews
  const overviewDiceBase = extractDiceFromHTML(parameters.overview.base);
  const overviewDiceProficient = extractDiceFromHTML(parameters.overview.proficient);
  const overviewDiceFluent = extractDiceFromHTML(parameters.overview.fluent);
  const overviewDiceHeightened = extractDiceFromHTML(parameters.heightened);
  if (Object.keys(overviewDiceBase).length) Object.assign(parameters.applies.base.rolls, overviewDiceBase);
  if (Object.keys(overviewDiceProficient).length) {
    Object.assign(parameters.applies.proficient.rolls, overviewDiceProficient);
  }
  if (Object.keys(overviewDiceFluent).length) {
    Object.assign(parameters.applies.fluent.rolls, overviewDiceFluent);
  }
  if (Object.keys(overviewDiceHeightened).length) {
    Object.assign(parameters.applies.heightened.rolls, overviewDiceHeightened);
  }

  // Extract dice from results for applies.base
  function extractDiceFromResultBar(barText) {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = barText || "";
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

  // Only process hit and fail/save as per instructions
  let resultDice = {};
  if (parameters.results.hit) {
    Object.assign(resultDice, extractDiceFromResultBar(parameters.results.hit));
  }
  // For feat abilities, use fail; for block abilities, use save
  if (parameters.interaction === "feat" && parameters.results.fail) {
    Object.assign(resultDice, extractDiceFromResultBar(parameters.results.fail));
  } else if (parameters.interaction === "block" && parameters.results.save) {
    Object.assign(resultDice, extractDiceFromResultBar(parameters.results.save));
  }
  if (Object.keys(resultDice).length) {
    Object.assign(parameters.applies.base.rolls, resultDice);
  }

  const applications = _override(abilityData.parent.name);
  if (applications) {
    parameters.applies = applications;
  }

  // Image selection
  let img = "systems/teriock/assets/ability.svg";
  if (parameters.spell) img = "systems/teriock/assets/spell.svg";
  else if (parameters.skill) img = "systems/teriock/assets/skill.svg";
  if (parameters.class) img = `systems/teriock/assets/classes/${parameters.class}.svg`;

  for (const el of subs) {
    console.log(el);
    const subNameEl = el.querySelector(".ability-sub-name");
    const namespace = subNameEl?.getAttribute("data-namespace");
    if (namespace === "Ability") {
      const subName = subNameEl.getAttribute("data-name");
      console.log(subName);
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

  console.log(parameters);

  return { changes, system: parameters, img };
}
