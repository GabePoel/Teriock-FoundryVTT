import { HTMLIdentifierTagsElement } from "../../applications/elements/_module.mjs";
import { omit } from "../../helpers/utils.mjs";
import IdentifierField from "./identifier-field.mjs";

const { SetField } = foundry.data.fields;

/**
 * {@link SetField} for a set of {@link IdentifierField} values.
 * @property {HTMLIdentifierTagsElement} element
 * @property {boolean} allowType
 * @property {string} type
 * @todo Consider making a `TeriockSetField` or something similar which just adds Identifier stuff.
 */
export default class IdentifierSetField extends SetField {
  /**
   * @param {StringFieldOptions & Teriock.Fields._IdentifierFieldOptions} [options]
   * @param {DataFieldContext} [context]
   */
  constructor(options = {}, context = {}) {
    const allowType = options.allowType ?? false;
    const type = options.type;
    const setOptions = omit(options, ["allowType", "type"]);
    super(new IdentifierField({ allowType, type }), setOptions, context);
  }

  /** @inheritDoc */
  _toInput(config) {
    Object.assign(config, {
      allowType: this.element.allowType,
      single: false,
      type: this.element.type,
    });
    return HTMLIdentifierTagsElement.create(config);
  }
}
