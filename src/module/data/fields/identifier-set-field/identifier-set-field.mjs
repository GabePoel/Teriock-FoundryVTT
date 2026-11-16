import { omit } from "../../../utils/_module.mjs";
import IdentifierField from "../identifier-field/identifier-field.mjs";

const { SetField } = foundry.data.fields;

/**
 * @import { DataFieldContext, StringFieldOptions } from "@common/data/_types.mjs";
 */

/**
 * A special {@link SetField} for a set of {@link IdentifierField} values.
 */
export default class IdentifierSetField extends SetField {
  /**
   * @param {StringFieldOptions & Teriock.Fields._IdentifierFieldOptions} [options]
   * @param {DataFieldContext} [context]
   */
  constructor(options = {}, context = {}) {
    const { suggestions, types } = options;
    super(new IdentifierField({ single: false, suggestions, types }), omit(options, ["suggestions", "types"]), context);
  }

  /** @inheritDoc */
  _toInput(config) {
    return this.element._toInput(Object.assign(config, { single: false }));
  }
}
