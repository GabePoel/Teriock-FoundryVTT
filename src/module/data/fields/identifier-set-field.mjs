import { HTMLIdentifierTagsElement } from "../../applications/elements/_module.mjs";
import { omit } from "../../helpers/utils.mjs";
import TypedIdentifierField from "./typed-identifier-field.mjs";

const { SetField } = foundry.data.fields;

/**
 * {@link SetField} for a set of {@link TypedIdentifierField} values.
 * @property {HTMLIdentifierTagsElement} element
 * @property {string[]} types
 */
export default class IdentifierSetField extends SetField {
  /**
   * @param {StringFieldOptions & Teriock.Fields._TypedIdentifierFieldOptions} [options]
   * @param {DataFieldContext} [context]
   */
  constructor(options = {}, context = {}) {
    const { types } = options;
    super(new TypedIdentifierField({ single: false, types }), omit(options, ["types"]), context);
  }

  /** @inheritDoc */
  _toInput(config) {
    Object.assign(config, {
      single: false,
      types: this.element.types,
    });
    return HTMLIdentifierTagsElement.create(config);
  }
}
