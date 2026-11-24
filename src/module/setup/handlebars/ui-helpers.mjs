import { createElement, makeIcon, makeIconClass, makeIconElement, toClass } from "../../utils/_module.mjs";

/**
 * Render an info icon that shows a rules tooltip on hover.
 * @param {string} identifier
 * @param {object} [options]
 * @param {{ dataset?: object, noImg?: boolean, noTable?: boolean }} [options.hash]
 * @returns {Handlebars.SafeString}
 */
function infoIcon(identifier, options = { hash: {} }) {
  if (!game.settings.get("teriock", "showInfoIcons")) { return new Handlebars.SafeString(""); }
  const { dataset = {}, noImg, noTable } = options.hash;
  const tooltipClass = toClass([noImg && "teriock-no-img", noTable && "teriock-no-table"]);
  const anchor = createElement("a", {
    className: "teriock-info-icon",
    dataset: {
      action: "openInfo",
      link: "",
      tooltipClass,
      tooltipDirection: "RIGHT",
      tooltipIdentifier: String(identifier),
      ...dataset,
    },
  });
  anchor.append(makeIconElement(TERIOCK.DISPLAY.icons.manifest.ui.info, "light"));
  return new Handlebars.SafeString(anchor.outerHTML);
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
