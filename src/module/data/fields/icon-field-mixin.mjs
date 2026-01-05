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
        const style = config.style || "regular";
        const inputElement = super._toInput(config);
        if (icon) {
          const element = document.createElement("div");
          element.className = "icon-input";
          const iconElement = makeIconElement(icon, style);
          const labelElement = document.createElement("label");
          if (config.id) {
            labelElement.htmlFor = config.id;
          }
          labelElement.dataset.tooltip = this.label || "";
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
