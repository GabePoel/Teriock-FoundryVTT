import { makeIcon, makeIconClass } from "../../helpers/icon.mjs";

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

export default { makeIcon: makeIconHelper, makeIconClass };
