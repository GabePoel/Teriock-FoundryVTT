import { makeIcon, makeIconClass } from "../../helpers/utils.mjs";

/**
 * CSS class for if a tab is active or inactive.
 * @param {string} active - Current tab
 * @param {string} tab - Tab to check
 * @returns {"active"|"inactive"}
 */
function tabActive(active, tab) {
  return active === tab ? "active" : "inactive";
}

/**
 * Render an icon element as HTML.
 * @see {@link makeIcon}
 * @param {string} icon
 * @param {...string} styles
 * @returns {string}
 */
function makeIconHelper(icon, ...styles) {
  return new Handlebars.SafeString(makeIcon(icon, ...styles));
}

/**
 * CSS class list for a toggleable button.
 * @param {boolean} bool
 * @returns {string}
 */
function toggleButton(bool) {
  return `toggle-button${bool ? " toggled" : ""}`;
}

const uiHelperEntries = [["makeIcon", makeIconHelper], ["makeIconClass", makeIconClass], ["tabActive", tabActive], [
  "toggleButton",
  toggleButton,
]];

export default uiHelperEntries;
