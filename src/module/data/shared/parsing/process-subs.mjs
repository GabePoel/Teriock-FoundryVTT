import { createAbility } from "../../../helpers/create-effects.mjs";

/**
 * Processes sub-abilities from the document.
 * Creates sub-abilities and applies limitations or improvements as needed.
 * @param {Array} subs - Array of subability container elements.
 * @param {TeriockItem | TeriockEffect} doc - The parent document.
 * @returns {Promise<void>} Promise that resolves when all sub-abilities are processed.
 * @private
 */
export async function processSubAbilities(subs, doc) {
  for (const el of subs) {
    el.querySelectorAll(".expandable-sub-main").forEach((e) => e.remove());
    let subNameEl = el.querySelector(".ability-sub-name");
    if (el.className.includes("expandable-container")) subNameEl = el;
    if (subNameEl.dataset.namespace === "Condition") return;
    const subName = subNameEl.getAttribute("data-name");
    const subAbility = await createAbility(doc, subName, {
      notify: false,
    });

    const limitation = el.querySelector(".limited-modifier");
    const improvement = el.querySelector(".improvement-modifier");
    const gifted = el.querySelector(".gifted-modifier");
    let limitationText = "";
    let improvementText = "";

    if (improvement) {
      const improvementSpans =
        improvement.querySelectorAll(".improvement-text");
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
      await subAbility.update(updateData);
    }
  }
  // }
}
