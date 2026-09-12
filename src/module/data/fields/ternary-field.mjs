import { HTMLTernaryButtonElement } from "../../applications/elements/_module.mjs";

const { BooleanField } = foundry.data.fields;

/**
 * @import { FormInputConfig } from "@common/data/_types.mjs";
 */

/**
 * A nullable boolean field rendered as a three-state toggle represented as `true`, `false`, or `null`.
 * Uses {@link HTMLTernaryButtonElement} for form input.
 */
export default class TernaryField extends BooleanField {
  /** @override */
  static get _defaults() {
    return Object.assign(super._defaults, { initial: null, nullable: true });
  }

  /** @override */
  _cast(value) {
    if (String(value) === "false") { return false; }
    if (String(value) === "true") { return true; }
    return null;
  }

  /**
   * @override
   * @param {FormInputConfig} config
   * @returns {HTMLTernaryButtonElement}
   */
  _toInput(config) {
    return HTMLTernaryButtonElement.create(config);
  }
}
