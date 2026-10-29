import { createElement } from "../../../utils/_module.mjs";

const { AbstractFormInputElement, HTMLStringTagsElement } = foundry.applications.elements;
const { TextEditor } = foundry.applications.ux;

/**
 * Abstract form element which displays tags above a text input.
 */
export default class AbstractTagsElement extends AbstractFormInputElement {
  /** @see {HTMLStringTagsElement.icons} */
  static icons = { remove: "fa-solid fa-xmark" };

  /** @see {HTMLStringTagsElement.labels} */
  static labels = { remove: "ELEMENTS.TAGS.Remove" };

  /**
   * Create an HTML element fragment for a single tag.
   * @param {string} key
   * @param {string} label
   * @param {boolean} [editable=true]
   * @returns {HTMLDivElement}
   */
  static renderTag(key, label, editable = true) {
    const truncated = TextEditor.truncateText(label, { maxLength: 32 });
    const tag = HTMLStringTagsElement.renderTag.call(this, key, truncated, editable);
    tag.querySelector("span").dataset.tooltipText = key;
    return tag;
  }

  /**
   * The list of tags.
   * @type {HTMLDivElement|null}
   */
  _tags = null;

  /** @inheritDoc */
  _buildElements() {
    this._tags = createElement("div", { className: "tags input-element-tags" });
    this._primaryInput = createElement("input", { placeholder: this.getAttribute("placeholder") ?? "", type: "text" });
    const group = createElement("div", { className: "input-group" });
    group.append(this._primaryInput);
    return [this._tags, group];
  }

  /** @inheritDoc */
  _toggleDisabled(disabled) {
    for (const element of this.querySelectorAll("input, button")) { element.disabled = disabled; }
  }
}
