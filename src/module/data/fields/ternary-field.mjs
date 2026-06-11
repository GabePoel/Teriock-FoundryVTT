import { HTMLTernaryElement } from "../../applications/elements/_module.mjs";

const { BooleanField } = foundry.data.fields;

/**
 * A nullable boolean field rendered as a three-state toggle represented as `true`, `false`, or `null`.
 * Uses {@link HTMLTernaryElement} for form input.
 */
export default class TernaryField extends BooleanField {
  /** @override */
  static get _defaults() {
    return Object.assign(super._defaults, { initial: null, nullable: true });
  }

  /** @override */
  _cast(value) {
    if (value === null || value === undefined || value === "" || value === "null") { return null; }
    if (value === false || value === "false") { return false; }
    if (value === true || value === "true") { return true; }
    return null;
  }

  /**
   * @override
   * @param {FormInputConfig} config
   * @returns {HTMLTernaryElement}
   */
  _toInput(config) {
    return HTMLTernaryElement.create(config);
  }
}
