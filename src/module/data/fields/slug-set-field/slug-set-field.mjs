import { omit } from "../../../utils/_module.mjs";
import SlugField from "../slug-field/slug-field.mjs";

const { SetField } = foundry.data.fields;

/**
 * @import { DataFieldContext, StringFieldOptions } from "@common/data/_types.mjs";
 */

/**
 * A special {@link SetField} for a set of {@link SlugField} values.
 * @category Identifiers
 */
export default class SlugSetField extends SetField {
  /**
   * @param {StringFieldOptions & Teriock.Fields._SlugFieldOptions} [options]
   * @param {DataFieldContext} [context]
   */
  constructor(options = {}, context = {}) {
    const { suggestions, types } = options;
    super(
      new SlugField({ blank: false, nullable: false, suggestions, types }),
      omit(options, ["suggestions", "types"]),
      context,
    );
  }

  /** @inheritDoc */
  _toInput(config) {
    return this.element._toInput(Object.assign(config, { single: false }));
  }
}
