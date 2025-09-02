import { ROLL_BUTTON_CONFIGS } from "../../effect-data/ability-data/methods/rolling/_roll-build-buttons.mjs";

/**
 * Remove sub-containers and convert .dice spans into enricher rolls.
 * Uses ROLL_BUTTON_CONFIGS when data-type matches; otherwise falls back to /roll.
 * @param {Document} doc
 * @returns {Document}
 */
export function cleanHTMLDoc(doc) {
  doc
    .querySelectorAll(".ability-sub-container, .expandable-container")
    .forEach((el) => el.remove());

  const TYPE_LUT = Object.fromEntries(
    Object.keys(ROLL_BUTTON_CONFIGS).map((k) => [k.toLowerCase(), k]),
  );

  doc.querySelectorAll(".dice").forEach((el) => {
    const fullRoll = el.getAttribute("data-full-roll");
    const quickRoll = el.getAttribute("data-quick-roll");
    const typeAttr = el.getAttribute("data-type") || "";
    const canonical = TYPE_LUT[typeAttr.toLowerCase()] || null;
    const formula = (fullRoll || quickRoll || "").trim();
    if (!formula) return;
    const tagType = canonical || "roll";
    el.textContent = `[[/${tagType} ${formula}]]`;
  });

  return doc;
}