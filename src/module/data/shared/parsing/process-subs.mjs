import { createAbility } from "../../../helpers/create-effects.mjs";

/**
 * Processes sub-abilities from the document.
 * Creates sub-abilities and applies limitations or improvements as needed.
 * @param {Array} subs - Array of subability container elements.
 * @param {TeriockBaseEffectData} effectData - The parent ability data.
 * @returns {Promise<void>} Promise that resolves when all sub-abilities are processed.
 * @private
 */
export async function processSubAbilities(subs, effectData) {
  for (const el of subs) {
    let subNameEl = el.querySelector(".ability-sub-name");
    if (el.className.includes("expandable-container")) subNameEl = el;
    if (subNameEl.dataset.namespace === "Condition") return;
    const subName = subNameEl.getAttribute("data-name");
    const subAbility = await createAbility(effectData.parent, subName, {
      notify: false,
    });

    const limitation = el.querySelector(".limited-modifier");
    const improvement = el.querySelector(".improvement-modifier");
    console.log(limitation);
    console.log(improvement);
    let limitationText = "";
    let improvementText = "";
    let newName = subName;

    if (improvement) {
      newName = "Improved " + subName;
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
      newName = "Limited " + newName;
      const limitationSpans = limitation.querySelectorAll(".limitation-text");
      if (limitationSpans) {
        const limitationSpan = limitationSpans[0];
        if (limitationSpan) {
          limitationText = limitationSpan.textContent.trim();
        }
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
  // }
}
