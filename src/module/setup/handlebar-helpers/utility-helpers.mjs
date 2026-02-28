import { systemPath } from "../../helpers/path.mjs";
import { makeIcon, makeIconClass } from "../../helpers/utils.mjs";

export default function registerUiHelpers() {
  Handlebars.registerHelper("systemPath", systemPath);

  Handlebars.registerHelper("template", (str) => {
    return systemPath("templates/" + str);
  });

  Handlebars.registerHelper("tabActive", (active, tab) =>
    active === tab ? "active" : "inactive",
  );

  Handlebars.registerHelper("makeIcon", (icon, ...styles) => {
    return new Handlebars.SafeString(makeIcon(icon, ...styles));
  });

  Handlebars.registerHelper("makeIconClass", (icon, ...styles) =>
    makeIconClass(icon, ...styles),
  );

  Handlebars.registerHelper("threeToggle", (options) => {
    const { name, disabled, id } = options.hash;
    let value;
    if (name && typeof name === "string") {
      const keys = name.split(".");
      value = options.data.root;
      for (const key of keys) {
        if (value && typeof value === "object" && key in value) {
          value = value[key];
        } else {
          value = undefined;
          break;
        }
      }
    }
    const attrs = [
      id ? `id="${id}"` : "",
      name ? `data-name="${name}"` : "",
      name ? `data-value="${value}"` : "",
      disabled ? "" : name ? 'data-action="toggleSwitch"' : "",
      disabled ? "disabled" : "",
    ];
    return new Handlebars.SafeString(`
      <div class="three-toggle">
        <button class="three-toggle-bg" ${attrs.join(" ")} data-never-disable="true">
          <div class="three-toggle-circle"></div>
        </button>
      </div>
    `);
  });

  Handlebars.registerHelper(
    "toggleButton",
    (bool) => `toggle-button${bool ? " toggled" : ""}`,
  );

  Handlebars.registerHelper("ticon", (icon, options) => {
    const {
      cssClass = "",
      id,
      parentId,
      action,
      style = "light",
      tooltip = "",
    } = options.hash;
    const attrs = [
      id ? `data-id="${id}"` : "",
      parentId ? `data-parent-id="${parentId}"` : "",
      action ? `data-action="${action}"` : "",
      tooltip ? `data-tooltip="${tooltip}"` : "",
    ].join(" ");
    return new Handlebars.SafeString(
      `<i class="ticon teriock-block-clickable ${cssClass} fa-fw fa-${style} fa-${icon}" ${attrs}></i>`,
    );
  });

  Handlebars.registerHelper(
    "ticonToggle",
    (iconTrue, iconFalse, bool, options) => {
      const {
        cssClass = "",
        id,
        parentId,
        action,
        falseAction = true,
        tooltipTrue = "",
        tooltipFalse = "",
      } = options.hash;

      const icon = bool ? iconTrue : iconFalse;

      // Determine action to use
      const resolvedAction = bool
        ? action
        : typeof falseAction === "string"
          ? falseAction
          : falseAction && action;

      const actionAttr = resolvedAction
        ? `data-action="${resolvedAction}"`
        : "";

      const tooltipAttr =
        (bool || falseAction) && action
          ? `data-tooltip="${bool ? tooltipTrue : tooltipFalse}"`
          : "";

      return new Handlebars.SafeString(`
        <i class="ticon teriock-block-clickable ${cssClass} fa-fw fa-light fa-${icon}" 
        ${id ? `data-id="${id}"` : ""} 
        ${parentId ? `data-parent-id="${parentId}"` : ""} 
        ${actionAttr}
        ${tooltipAttr}></i>
    `);
    },
  );
}
