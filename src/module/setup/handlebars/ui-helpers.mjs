import { makeIcon, makeIconClass } from "../../helpers/icon.mjs";

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

const uiHelperEntries = [["makeIcon", makeIconHelper], ["makeIconClass", makeIconClass], ["tabActive", tabActive]];

export default uiHelperEntries;
