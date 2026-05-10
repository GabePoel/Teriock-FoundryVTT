import { makeIcon, makeIconClass } from "../../helpers/utils.mjs";

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
 * @returns {Handlebars.SafeString}
 */
function makeIconHelper(icon, ...styles) {
  return new Handlebars.SafeString(makeIcon(icon, ...styles));
}

/**
 * Three-state toggle control markup.
 * @param {import("handlebars").HelperOptions} options
 * @returns {Handlebars.SafeString}
 */
function threeToggle(options) {
  const { name, disabled, id } = options.hash;
  let value;
  if (name && typeof name === "string") {
    value = foundry.utils.getProperty(options.data.root, name);
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
}

/**
 * CSS class list for a toggleable button.
 * @param {boolean} bool
 * @returns {string}
 */
function toggleButton(bool) {
  return `toggle-button${bool ? " toggled" : ""}`;
}

const uiHelperEntries = [
  ["makeIcon", makeIconHelper],
  ["makeIconClass", makeIconClass],
  ["tabActive", tabActive],
  ["threeToggle", threeToggle],
  ["toggleButton", toggleButton],
];

export default uiHelperEntries;
