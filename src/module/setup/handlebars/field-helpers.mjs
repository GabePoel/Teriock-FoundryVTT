import { createElement } from "../../helpers/html.mjs";
import { makeIconClass, makeIconElement } from "../../helpers/icon.mjs";
import { toKebabCase } from "../../helpers/string.mjs";

/**
 * @import { FormInputConfig } from "@common/data/_types.mjs";
 * @import { DataField } from "@common/data/fields.mjs";
 */

/**
 * Make a unique element ID.
 * @param {object} options
 * @param {...string} parts
 * @returns {string}
 */
function makeElementId(options, ...parts) {
  return [options.data?.root?.appId, ...parts].filter(Boolean).join("-").replace(/\s+/g, "-");
}

/**
 * @typedef FormClassesHash
 * @property {boolean} changed
 * @property {boolean} isPlaceholder
 * @property {boolean} locked
 * @property {string} path
 */

/**
 * Add classes that style a form.
 * @param {AbstractData} model
 * @param {object} [options]
 * @param {Partial<FormClassesHash>} [options.hash]
 * @returns {string}
 */
function formClasses(model, options = { hash: {} }) {
  const { changed, isPlaceholder, locked } = options.hash;
  const path = String(options.hash.path ?? "");
  let cssClass = "teriock-form-value";
  if (
    (changed ?? foundry.utils.hasProperty(model?.overrides, path))
    && game.settings.get("teriock", "highlightModifiedValues")
  ) { cssClass += " teriock-form-changed"; } else if (locked ?? model?.system?.lockedPaths?.has?.(path)) {
    cssClass += " teriock-form-locked";
  }
  if (isPlaceholder) { cssClass += " teriock-form-placeholder"; }
  return cssClass;
}

/**
 * @typedef {FormClassesHash} FormUpdaterHash
 * @property {Record<string, string>} dataset
 * @property {string} abbreviation
 * @property {string} action
 * @property {string} color
 * @property {string} data
 * @property {string} icon
 * @property {string} label
 * @property {string} paths
 * @property {string} placeholder
 * @property {string} source
 */

/**
 * Make a box that shows opens an updater.
 * @param {AbstractData} model
 * @param {object} [options]
 * @param {Partial<FormUpdaterHash>} [options.hash]
 * @returns {Handlebars.SafeString}
 * @todo Simplify if possible.
 */
function formUpdater(model, options = { hash: {} }) {
  const { abbreviation, action = "updatePaths", changed, color, dataset = {}, icon, locked } = options.hash;
  let { data, isPlaceholder = false, label, paths, placeholder, source } = options.hash;
  const path = String(options.hash.path ?? "");
  label ||= model?.getFieldForProperty(path)?.label || "";
  placeholder = _loc(String(placeholder || model?.getFieldForProperty(path)?.placeholder || ""));
  paths ??= path;
  if (data != null && data !== "") { source ??= data; }
  data ??= model?.getStringForProperty(path, { list: "unit", source: false }) ?? "";
  source ??= model?.getStringForProperty(path, { list: "unit", source: true }) ?? "";
  let isSourcePlaceholder = false;
  if (data === "") {
    data = placeholder;
    isPlaceholder = true;
  }
  if (source === "") {
    source = placeholder;
    isSourcePlaceholder = true;
  }

  const containerElement = createElement("button", {
    className: "teriock-updater-container",
    dataset: foundry.utils.mergeObject({ action: action ?? "updatePaths", icon, paths }, dataset),
    id: options.hash.id ?? makeElementId(options, action, paths),
    type: "button",
  });
  const displayElement = createElement("span", { className: "teriock-updater-display" });
  if (icon) {
    const iconContainerElement = createElement("span", {
      className: "teriock-updater-icon",
      dataset: { tooltip: label },
    });
    const iconElement = createElement("i", { className: makeIconClass(icon, "light") });
    if (color) { iconElement.style.color = color; }
    iconContainerElement.append(iconElement);
    displayElement.append(iconContainerElement);
  }
  const valueElement = createElement("span", {
    className: `teriock-updater-value ${formClasses(model, { hash: { changed, locked, path } })}`,
  });
  valueElement.append(
    createElement("span", {
      className: `teriock-updater-data${isPlaceholder ? " teriock-form-placeholder" : ""}`,
      innerHTML: data,
    }),
  );
  if (String(data) !== String(source) || (changed ?? foundry.utils.hasProperty(model?.overrides, path))) {
    valueElement.append(
      createElement("span", {
        className: `teriock-updater-source${isSourcePlaceholder ? " teriock-form-placeholder" : ""}`,
        innerHTML: source,
      }),
    );
  }
  displayElement.append(valueElement);
  if (abbreviation) {
    displayElement.append(
      createElement("span", { className: "teriock-updater-abbreviation", textContent: _loc(abbreviation) }),
    );
  }
  containerElement.append(displayElement);
  return new Handlebars.SafeString(containerElement.outerHTML);
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

/**
 * Make a box that changes value on hover.
 * @param {AbstractData} model
 * @param {object} [options]
 * @returns {Handlebars.SafeString}
 * @deprecated
 * @todo Find a way to replace this with something more similar to `formUpdater` or block helpers?
 */
function formHover(model, options = { hash: {} }) {
  const {
    action,
    classes = "",
    dataset = {},
    icon,
    path = "",
    paths = path,
    selected,
    selectedFormat,
    unselected,
    unselectedFormat,
  } = options.hash;
  if (icon) { dataset.icon = icon; }
  if (action) { dataset.action = action; }
  if (paths) { dataset.paths = paths; }
  const dataAttrs = Object.entries(dataset).map(([k, v]) => `data-${toKebabCase(k)}="${v}"`).join(" ");
  const unselectedValue = unselectedFormat ?? unselected;
  const selectedValue = selected === null ? unselectedValue : selectedFormat ?? selected;
  const cssClasses = ["affix", classes, formClasses(model, { hash: { path } })];
  if (selected === null) { cssClasses.push("details-muted"); }
  const id = options.hash.id ?? makeElementId(options, action, paths || dataset.path);
  return new Handlebars.SafeString(`
    <button type="button" id="${id}" class="${cssClasses.filter(Boolean).join(" ")}" ${dataAttrs}>
      <span class="selected">${selectedValue}</span>
      <span class="unselected">${unselectedValue}</span>
    </button>
  `);
}

export default { formClasses, formHover, formIcon, formUpdater };
