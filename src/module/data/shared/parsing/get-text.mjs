import { cleanFeet } from "../../../helpers/clean.mjs";
import { toTitleCase } from "../../../helpers/string.mjs";

/**
 * Helper function to get bar text content from ability bars.
 * Optionally cleans and formats the text for display.
 * @param {HTMLElement} htmlElement - The parsed HTML document.
 * @param {string} selector - The selector for the bar content.
 * @param {boolean} clean - Whether to clean and format the text.
 * @returns {string|null} The bar text content or null if not found.
 * @private
 */
export function getBarText(htmlElement, selector, clean = false) {
  const el = htmlElement.querySelector(
    `.ability-bar-${selector} .ability-bar-content`,
  );
  el?.querySelectorAll(".ability-bar").forEach((el2) => el2.remove());
  let text = el?.innerHTML || null;
  if (text && clean) {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = text;
    tempDiv
      .querySelectorAll("span")
      .forEach((span) => span.replaceWith(document.createTextNode(" ")));
    text = tempDiv.innerHTML.trim().replace(/\.$/, "").replace(/\./g, ",");
    text = toTitleCase(text);
    text = cleanFeet(text).trim();
  }
  return text;
}

/**
 * Helper function to get the HTML element for a given ability bar.
 * @param {HTMLElement} htmlElement
 * @param {string} selector
 * @returns {HTMLElement|null}
 */
export function getBarElement(htmlElement, selector) {
  return (
    htmlElement.querySelector(
      `.ability-bar-${selector} .ability-bar-content`,
    ) || null
  );
}

/**
 * Helper function to get text content from elements.
 * @param {Document} doc - The parsed HTML document.
 * @param {string} selector - The CSS selector for the element.
 * @returns {string|null} The text content or null if not found.
 * @private
 */
export function getText(doc, selector) {
  return doc.querySelector(`.${selector}`)?.innerHTML || null;
}
