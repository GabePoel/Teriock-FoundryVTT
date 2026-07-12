import { createElement } from "../../helpers/html.mjs";
import { makeIconClass, makeIconElement } from "../../helpers/icon.mjs";

/** Displayed value length past which overflowing content gets a full-text tooltip. */
const OVERFLOW_TOOLTIP_THRESHOLD = 16;

/**
 * Builds an HTML attribute string, or an empty string when the value is blank.
 * @param {string} name - Attribute name.
 * @param {*} value - Attribute value.
 * @returns {string}
 */
function attr(name, value) {
  return value != null && String(value).length > 0 ? ` ${name}="${value}"` : "";
}

/**
 * Renders a labeled form box.
 * @param {string} input - Main (selected) HTML or text content.
 * @param {object} options
 * @returns {Handlebars.SafeString}
 */
function formBox(input, options) {
  const {
    action = "",
    classes = "",
    dataset = {},
    icon = "info",
    iconColor = "",
    include = true,
    label = "",
    overflow = false,
    tooltip = "",
    unselected = "",
  } = options.hash;
  if (!include) { return new Handlebars.SafeString(""); }

  const hasUnselected = String(unselected).length > 0;
  const displayed = hasUnselected ? String(unselected) : String(input);
  const content = hasUnselected
    ? `<div class="unselected">${unselected}</div><div class="selected">${input}</div>`
    : input;

  const iconStr = String(icon).startsWith("<i")
    ? icon
    : `<i class="${makeIconClass(icon, "light")}"${attr("data-tooltip", tooltip)}></i>`;
  const datasetStr = Object.entries(dataset).map(([key, value]) => attr(`data-${key}`, value)).join("");
  const overflowTooltip = overflow && displayed.length > OVERFLOW_TOOLTIP_THRESHOLD ? displayed : "";

  const out = `
    <div class="ab-box-container">
      <div class="ab-box${classes ? ` ${classes}` : ""}"${attr("data-action", action)}${datasetStr}>
        <div class="ab-box-icon"${attr("style", iconColor ? `color: ${iconColor};` : "")}>
          ${iconStr}
        </div>
        <div class="ab-box-content${overflow ? " ab-text-content" : ""}"${attr("data-tooltip", overflowTooltip)}>
          ${content}
        </div>
        ${label ? `<div class="ab-box-label" style="text-transform: none;">${label}</div>` : ""}
      </div>
    </div>`;
  return new Handlebars.SafeString(out);
}

/**
 * @param {DataField} field
 * @param {{ hash: FormInputConfig & { icon: string } }} options
 * @returns {Handlebars.SafeString}
 */
function formIcon(field, options = {}) {
  const group = createElement("label", { className: "teriock-icon-input-group" });
  const input = field.toInput(options.hash);
  const icon = makeIconElement(options.hash.icon, "solid");
  icon.dataset.tooltip = _loc(field.label);
  group.append(...[icon, input]);
  return new Handlebars.SafeString(group.outerHTML);
}

const fieldHelperEntries = [["formBox", formBox], ["formIcon", formIcon]];

export default fieldHelperEntries;
