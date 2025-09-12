import { createAbility, createProperty } from "../../../helpers/create-effects.mjs";

/**
 * Generic function to process sub effects from the document.
 * Creates sub effects and applies limitations or improvements as needed.
 * @param {Array} subs - Array of sub effect container elements.
 * @param {TeriockItem | TeriockEffect} doc - The parent document.
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

  /** @type {() => TeriockEffect[]} */
    // const getFunction = doc[getMethod];
  const existingSubs = doc[getMethod]();
  /** @type {Set<string>} */
  const newSubNames = new Set();

  for (const el of subs) {
    el.querySelectorAll(".expandable-sub-main").forEach((e) => e.remove());

    let subNameEl = el.querySelector(nameSelector);
    if (el.className.includes("expandable-container")) {
      subNameEl = el;
    }
    if (subNameEl?.dataset.namespace === skipNamespace || subNameEl?.dataset.namespace !== includeNamespace) {
      return;
    }

    const subName = subNameEl.getAttribute("data-name");
    newSubNames.add(subName);
    let subEffect = existingSubs.find((s) => s.name === subName);
    if (subEffect) {
      await subEffect.system.wikiPull({ notify: false });
    } else {
      subEffect = await createFn(doc, subName, {
        notify: false,
      });
    }

    const limitation = el.querySelector(".limited-modifier");
    const improvement = el.querySelector(".improvement-modifier");
    const gifted = el.querySelector(".gifted-modifier");
    let limitationText = "";
    let improvementText = "";

    if (improvement) {
      const improvementSpans = improvement.querySelectorAll(".improvement-text");
      if (improvementSpans) {
        const improvementSpan = improvementSpans[0];
        if (improvementSpan) {
          improvementText = improvementSpan.textContent.trim();
        }
      }
    }

    if (limitation) {
      const limitationSpans = limitation.querySelectorAll(".limitation-text");
      if (limitationSpans) {
        const limitationSpan = limitationSpans[0];
        if (limitationSpan) {
          limitationText = limitationSpan.textContent.trim();
        }
      }
    }

    if (limitationText || improvementText || gifted) {
      const updateData = {
        "system.improvement": improvementText,
        "system.limitation": limitationText,
      };
      if (gifted) {
        updateData["system.gifted.enabled"] = true;
        updateData["system.gifted.amount"] = 1;
      }
      await subEffect.update(updateData);
    }
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
 * @param {TeriockItem | TeriockEffect} doc - The parent document.
 * @returns {Promise<void>} Promise that resolves when all sub-abilities are processed.
 * @private
 */
export async function processSubAbilities(subs, doc) {
  return processSubEffects(subs, doc, {
    createFn: createAbility,
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
 * @param {TeriockItem | TeriockEffect} doc - The parent document.
 * @returns {Promise<void>} Promise that resolves when all sub-properties are processed.
 * @private
 */
export async function processSubProperties(subs, doc) {
  return processSubEffects(subs, doc, {
    createFn: createProperty,
    nameSelector: ".ability-sub-name",
    skipNamespace: "Condition",
    includeNamespace: "Property",
    getMethod: "getProperties",
  });
}
