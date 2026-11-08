const { SchemaField } = foundry.data.fields;

/**
 * @import { TeriockActiveEffect } from "../../../documents/_module.mjs";
 */

/**
 * A special class of {@link SchemaField} which applies its changes to multiple paths in its data schema.
 */
export default class MultiChangeField extends SchemaField {
  /** @inheritDoc */
  static get _defaults() {
    return Object.assign(super._defaults, { multiChangePaths: null });
  }

  /**
   * The paths a wildcard change applies to. These changes are applied in {@link TeriockActiveEffect._applyChangeMulti}.
   * @returns {string[]}
   */
  get changePaths() {
    return this.multiChangePaths ?? Object.keys(this.fields);
  }
}
