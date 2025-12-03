import { getAbility, getProperty } from "../../../helpers/fetch.mjs";
import { inferCompendiumSource } from "../../../helpers/utils.mjs";
import { cleanObject } from "./clean-html-doc.mjs";

/**
 * Generic function to process sub effects from the document.
 * Creates sub effects and applies limitations or improvements as needed.
 * @param {Array} subs - Array of sub effect container elements.
 * @param {TeriockChild} doc - The parent document.
 * @param {object} config - Configuration object for processing.
 * @param {Function} config.createFn - Function to create the sub effect (e.g., createAbility, createProperty).
 * @param {string} config.getMethod - Method to get existing sub effects (e.g., getAbilities, getProperties).
 * @param {string} config.nameSelector - CSS selector for the sub effect name element.
 * @param {string} [config.skipNamespace] - Namespace to skip processing for.
 * @param {string} [config.includeNamespace] - Namespace to process.
 * @returns {Promise<void>} Promise that resolves when all sub effects are processed.
 * @private
 */
async function processSubEffects(subs, doc, config) {
  const {
    createFn,
    nameSelector,
    skipNamespace = "Condition",
    includeNamespace = "Ability",
    getMethod = "getAbilities",
  } = config;
  /** @type {TeriockEffect[]} */
  const existingSubs = await doc[getMethod]();
  /** @type {Set<string>} */
  const newSubNames = new Set();

  for (const el of subs) {
    el.querySelectorAll(".expandable-sub-main").forEach((e) => e.remove());

    let subNameEl = el.querySelector(nameSelector);
    if (el.className.includes("expandable-container")) {
      subNameEl = el;
    }
    if (
      subNameEl?.dataset.namespace === skipNamespace ||
      subNameEl?.dataset.namespace !== includeNamespace
    ) {
      break;
    }

    const subName = subNameEl.getAttribute("data-name");
    newSubNames.add(subName);
    let subEffect = existingSubs.find((s) => s.name === subName);
    if (subEffect) {
      await subEffect.system.refreshFromCompendiumSource({
        deleteChildren: true,
      });
    } else {
      subEffect = await createFn(subName);
      const newEffects = await doc.createChildDocuments("ActiveEffect", [
        subEffect.toObject(),
      ]);
      subEffect = newEffects[0];
    }

    const limitation = el.querySelector(".limited-modifier");
    const improvement = el.querySelector(".improvement-modifier");
    const gifted = el.querySelector(".gifted-modifier");
    const adept = el.querySelector(".adept-modifier");
    let limitationText = "";
    let improvementText = "";

    if (improvement) {
      const improvementSpans =
        improvement.querySelectorAll(".improvement-text");
      if (improvementSpans) {
        const improvementSpan = improvementSpans[0];
        if (improvementSpan) {
          improvementText = improvementSpan.innerHTML;
        }
      }
    }

    if (limitation) {
      const limitationSpans = limitation.querySelectorAll(".limitation-text");
      if (limitationSpans) {
        const limitationSpan = limitationSpans[0];
        if (limitationSpan) {
          limitationText = limitationSpan.innerHTML;
        }
      }
    }

    if (limitationText || improvementText || gifted || adept) {
      const updateData = {
        "system.improvement": improvementText,
        "system.limitation": limitationText,
      };
      if (gifted) {
        updateData["system.gifted.enabled"] = true;
        updateData["system.gifted.amount"] = 1;
      }
      if (adept) {
        updateData["system.adept.enabled"] = true;
        updateData["system.adept.amount"] = 1;
      }
      foundry.utils.expandObject(updateData);
      cleanObject(
        updateData,
        ["system.improvement", "system.limitation"],
        subEffect.name,
      );
      await subEffect.update(updateData);
    }
    await inferCompendiumSource(subEffect);
  }

  const toDelete = [];
  for (const sub of existingSubs) {
    if (!newSubNames.has(sub.name)) {
      toDelete.push(sub.id);
    }
  }
  if (doc.documentName === "Item") {
    await doc.deleteEmbeddedDocuments("ActiveEffect", toDelete);
  } else if (doc.documentName === "ActiveEffect") {
    await doc.parent.deleteEmbeddedDocuments("ActiveEffect", toDelete);
  }
}

/**
 * Processes sub-abilities from the document.
 * Creates sub-abilities and applies limitations or improvements as needed.
 * @param {Array} subs - Array of subability container elements.
 * @param {TeriockChild} doc - The parent document.
 * @returns {Promise<void>} Promise that resolves when all sub-abilities are processed.
 * @private
 */
export async function processSubAbilities(subs, doc) {
  return processSubEffects(subs, doc, {
    createFn: getAbility,
    nameSelector: ".ability-sub-name",
    skipNamespace: "Condition",
    includeNamespace: "Ability",
    getMethod: "getAbilities",
  });
}

/**
 * Processes sub-properties from the document.
 * Creates sub-properties and applies limitations or improvements as needed.
 * @param {Array} subs - Array of sub-property container elements.
 * @param {TeriockChild} doc - The parent document.
 * @returns {Promise<void>} Promise that resolves when all sub-properties are processed.
 * @private
 */
export async function processSubProperties(subs, doc) {
  return processSubEffects(subs, doc, {
    createFn: getProperty,
    nameSelector: ".ability-sub-name",
    skipNamespace: "Condition",
    includeNamespace: "Property",
    getMethod: "getProperties",
  });
}
