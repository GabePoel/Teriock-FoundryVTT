import { createElement } from "../../helpers/html.mjs";
import { makeIconElement } from "../../helpers/utils.mjs";

/**
 * Mixin to allow icons embedded in data fields.
 * @param {typeof StringField} Base
 * @param {number} optionsIndex
 */
export default function iconFieldMixin(Base, optionsIndex = 0) {
  return (
    /**
     * @extends {StringField}
     * @mixin
     */
    class IconField extends Base {
      constructor(...args) {
        const icon = args[optionsIndex].icon ?? null;
        super(...args);
        this.icon = icon;
      }

      /** @inheritDoc */
      _toInput(config) {
        const icon = config.icon || this.icon;
        const style = config.style || "light";
        const inputElement = super._toInput(config);
        if (icon) {
          const element = createElement("div", { className: "icon-input" });
          const iconElement = makeIconElement(icon, style);
          const labelElement = createElement("label", { "dataset.tooltip": this.label || "", htmlFor: config.id });
          labelElement.appendChild(iconElement);
          element.appendChild(labelElement);
          element.appendChild(inputElement);
          return element;
        }
        return inputElement;
      }
    }
  );
}
