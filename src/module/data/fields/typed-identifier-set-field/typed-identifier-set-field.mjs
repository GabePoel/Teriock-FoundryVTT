import { omit } from "../../../helpers/utils.mjs";
import TypedIdentifierField from "../typed-identifier-field/typed-identifier-field.mjs";

const { SetField } = foundry.data.fields;

/**
 * @import { DataFieldContext, StringFieldOptions } from "@common/data/_types.mjs";
 */

/**
 * A special {@link SetField} for a set of {@link TypedIdentifierField} values.
 */
export default class TypedIdentifierSetField extends SetField {
  /**
   * @param {StringFieldOptions & Teriock.Fields._TypedIdentifierFieldOptions} [options]
   * @param {DataFieldContext} [context]
   */
  constructor(options = {}, context = {}) {
    const { suggestions, types } = options;
    super(
      new TypedIdentifierField({ single: false, suggestions, types }),
      omit(options, ["suggestions", "types"]),
      context,
    );
  }

  /** @inheritDoc */
  _toInput(config) {
    return this.element._toInput(Object.assign(config, { single: false }));
  }
}
