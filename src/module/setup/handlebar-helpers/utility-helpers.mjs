import { makeIcon, makeIconClass } from "../../helpers/utils.mjs";

export default function registerUiHelpers() {
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
}
