export default function registerFieldHelpers() {
  Handlebars.registerHelper("formBox", (input, options) => {
    const {
      secondary = "",
      icon = "info",
      after = true,
      label = "",
      include = true,
      includeSecondary = true,
    } = options.hash;
    let content = input;
    const hasSecondaryContent = includeSecondary && (secondary.toString() ? secondary.toString().length > 0 : false);
    const hasLabel = label ? label.length > 0 : false;
    const labelText = `<div class="ab-box-label" style="text-transform: none;">${label}</div>`;
    if (hasSecondaryContent) {
      if (after) {
        content = content + "&nbsp;/&nbsp;" + secondary;
      } else {
        content = secondary + "&nbsp;/&nbsp;" + content;
      }
    }
    let iconStr = `<i class="fa-fw fa-light fa-${icon}"></i>`;
    if (icon.toString().startsWith("<i")) {
      iconStr = icon;
    }
    if (include) {
      const out = `
        <div class="ab-box-container">
          <div class="ab-box">
            <div class="ab-box-icon">
              ${iconStr}
            </div>
            <div class="ab-box-content ${hasSecondaryContent ? "ab-split-input" : ""}">
              ${content}
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