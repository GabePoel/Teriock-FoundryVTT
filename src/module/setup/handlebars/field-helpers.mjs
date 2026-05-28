import { makeIconClass } from "../../helpers/utils.mjs";

/**
 * Renders a labeled form box.
 * @param {string} input - Main (selected) HTML or text content.
 * @param {object} options
 * @returns {string}
 */
function formBox(input, options) {
  const {
    action = "",
    after = true,
    classes = "",
    dataset = {},
    icon = "info",
    iconColor = "",
    include = true,
    includeSecondary = true,
    label = "",
    overflow = "",
    secondary = "",
    tooltip = "",
    unselected = "",
    unselectedSecondary = "",
  } = options.hash;
  let content = input;
  let overflowTooltip = "";
  let overflowContent = overflow;
  if (overflow === true) { overflowContent = input; }
  if (overflowContent && overflowContent.length > 16) { overflowTooltip = `data-tooltip="${overflowContent}"`; }
  const hasSecondaryContent = includeSecondary && (secondary.toString() ? secondary.toString().length > 0 : false);
  let unselectedContent = unselected;
  const hasUnselected = unselected.toString() ? unselected.toString().length > 0 : false;
  if (hasUnselected) {
    if (hasSecondaryContent) {
      if (after) { unselectedContent = `${unselected}&nbsp;/&nbsp;${unselectedSecondary}`; }
      else { unselectedContent = `${unselectedSecondary}&nbsp;/&nbsp;${unselected}`; }
    }
    unselectedContent = `<div class="unselected">${unselectedContent}</div>`;
  }
  const hasLabel = label ? label.length > 0 : false;
  const labelText = `<div class="ab-box-label" style="text-transform: none;">${label}</div>`;
  if (hasSecondaryContent) {
    if (after) { content = `${content}&nbsp;/&nbsp;${secondary}`; }
    else { content = `${secondary}&nbsp;/&nbsp;${content}`; }
  }
  if (hasUnselected) { content = `<div class="selected">${content}</div>`; }
  const tooltipStr = tooltip && tooltip.toString().length > 0 ? `data-tooltip="${tooltip}"` : "";
  let iconStr = `<i class="${makeIconClass(icon, "light")}" ${tooltipStr}></i>`;
  let styleStr = "";
  if (iconColor && iconColor.toString().length > 0) { styleStr = `style="color: ${iconColor};"`; }
  if (icon.toString().startsWith("<i")) { iconStr = icon; }
  const classesStr = classes ? classes : "";
  const actionStr = action ? `data-action="${action}"` : "";
  let datasetStr = "";
  for (const [key, value] of Object.entries(dataset)) { datasetStr += `data-${key}="${value}"`; }
  if (include) {
    const out = `
        <div class="ab-box-container">
          <div class="ab-box ${classesStr}" ${actionStr} ${datasetStr}>
            <div class="ab-box-icon" ${styleStr}>
              ${iconStr}
            </div>
            <div 
              class="ab-box-content ${overflow ? "ab-text-content" : ""} ${hasSecondaryContent ? "ab-split-input" : ""}"
              ${overflowTooltip}
            >
              ${unselectedContent}${content}
            </div>
            ${hasLabel ? labelText : ""}
          </div>
        </div>
      `;
    return new Handlebars.SafeString(out);
  }
  return new Handlebars.SafeString("");
}

const fieldHelperEntries = [["formBox", formBox]];

export default fieldHelperEntries;
