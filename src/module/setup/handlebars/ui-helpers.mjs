import { icons } from "../../static/display/_module.mjs";
import { makeIcon, makeIconClass, makeIconElement } from "../../utils/_module.mjs";

/**
 * Render an info icon that shows a rules tooltip on hover.
 * @param {string} identifier
 * @param {object} [options]
 * @param {{ dataset?: object, noTables?: boolean }} [options.hash]
 * @returns {Handlebars.SafeString}
 */
function infoIcon(identifier, options = { hash: {} }) {
  const { dataset = {}, noTables } = options.hash;
  const element = makeIconElement(icons.manifest.ui.info, "light");
  element.classList.add("teriock-info-icon");
  Object.assign(
    element.dataset,
    { tooltipDirection: "RIGHT", tooltipIdentifier: String(identifier) },
    noTables && { tooltipClass: "teriock-no-tables" },
    dataset,
  );
  return new Handlebars.SafeString(element.outerHTML);
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

export default { infoIcon, makeIcon: makeIconHelper, makeIconClass };
