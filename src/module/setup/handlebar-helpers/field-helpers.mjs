export default function registerFieldHelpers() {
  Handlebars.registerHelper("formBox", (input, options) => {
    const {
      secondary = "",
      icon = "info",
      iconColor = "",
      after = true,
      label = "",
      include = true,
      includeSecondary = true,
      unselected = "",
      unselectedSecondary = "",
      tooltip = "",
      action = "",
      classes = "",
      dataset = {},
    } = options.hash;
    let content = input;
    const hasSecondaryContent = includeSecondary && (secondary.toString() ? secondary.toString().length > 0 : false);
    let unselectedContent = unselected;
    const hasUnselected = unselected.toString() ? unselected.toString().length > 0 : false;
    if (hasUnselected) {
      if (hasSecondaryContent) {
        if (after) {
          unselectedContent = unselected + "&nbsp;/&nbsp;" + unselectedSecondary;
        } else {
          unselectedContent = unselectedSecondary + "&nbsp;/&nbsp;" + unselected;
        }
      }
      unselectedContent = `<div class="unselected">${unselectedContent}</div>`;
    }
    const hasLabel = label ? label.length > 0 : false;
    const labelText = `<div class="ab-box-label" style="text-transform: none;">${label}</div>`;
    if (hasSecondaryContent) {
      if (after) {
        content = content + "&nbsp;/&nbsp;" + secondary;
      } else {
        content = secondary + "&nbsp;/&nbsp;" + content;
      }
    }
    if (hasUnselected) {
      content = `<div class="selected">${content}</div>`;
    }
    let iconStr = `<i class="fa-fw fa-light fa-${icon}"></i>`;
    let styleStr = "";
    if (iconColor && iconColor.toString().length > 0) {
      styleStr = `style="color: ${iconColor};"`;
    }
    if (icon.toString().startsWith("<i")) {
      iconStr = icon;
    }
    const tooltipStr = tooltip && tooltip.toString().length > 0 ? `data-tooltip="${tooltip}"` : "";
    const classesStr = classes ? classes : "";
    const actionStr = action ? `data-action="${action}"` : "";
    let datasetStr = "";
    for (const [ key, value ] of Object.entries(dataset)) {
      datasetStr += `data-${key}="${value}"`;
    }
    if (include) {
      const out = `
        <div class="ab-box-container">
          <div class="ab-box ${classesStr}" ${actionStr} ${datasetStr}>
            <div class="ab-box-icon" ${styleStr}>
              ${iconStr}
            </div>
            <div class="ab-box-content ${hasSecondaryContent ? "ab-split-input" : ""}" ${tooltipStr}>
              ${unselectedContent}${content}
            </div>
            ${hasLabel ? labelText : ""}
          </div>
        </div>
      `;
      return new Handlebars.SafeString(out);
    } else {
      return new Handlebars.SafeString("");
    }
  });
}