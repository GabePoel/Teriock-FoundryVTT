const { AnyField, StringField } = foundry.data.fields;

/**
 * @import { FormInputConfig } from "@common/data/_types.mjs";
 */

/**
 * A special {@link AnyField} for a change's value which renders the input its change type defines.
 */
export default class ChangeValueField extends AnyField {
  /** @inheritDoc */
  static get _defaults() {
    return Object.assign(super._defaults, {
      initial: "",
      label: "EFFECT.FIELDS.changes.element.value.label",
      required: true,
      serializable: true,
    });
  }

  /**
   * @inheritDoc
   * @param {FormInputConfig & { changeType?: Teriock.Changes.Type }} config
   */
  _toInput(config) {
    const field = TERIOCK.CONFIG.change.types[config.changeType]?.value?.() ?? new StringField();
    return field.toInput(config);
  }
}
