import ChildDataMixin from "../../mixins/child-mixin.mjs";

const { TypeDataModel } = foundry.abstract;
const { fields } = foundry.data;

/**
 * Base item data model for all Teriock items.
 * Provides common functionality for disabled state and update tracking.
 *
 * @extends {TypeDataModel}
 */
export default class TeriockBaseItemData extends ChildDataMixin(TypeDataModel) {
  /**
   * Get the actor associated with this item data.
   *
   * @returns {TeriockActor}
   */
  get actor() {
    return this.parent.actor;
  }

  /**
   * Defines the schema for the base item data model.
   *
   * @returns {object} The schema definition for the base item data.
   * @override
   */
  static defineSchema() {
    return foundry.utils.mergeObject(super.defineSchema(), {
      disabled: new fields.BooleanField({
        initial: false,
        label: "Disabled",
      }),
      updateCounter: new fields.BooleanField({
        initial: false,
        label: "Update Counter",
      }),
      onUse: new fields.SetField(new fields.DocumentIdField()),
    });
  }
}
