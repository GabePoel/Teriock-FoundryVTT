// Allows for typing within mixin.
/** @import TypeDataModel from "@common/abstract/type-data.mjs" */
const { fields } = foundry.data;
const { TypeDataModel } = foundry.abstract;
import { ChildDataMixin } from "../../mixins/child-mixin.mjs";

/**
 * Base item data model for all Teriock items.
 * Provides common functionality for disabled state and update tracking.
 * @extends {TypeDataModel}
 */
export default class TeriockBaseItemData extends ChildDataMixin(TypeDataModel) {
  /**
   * Defines the schema for the base item data model.
   * @override
   * @returns {object} The schema definition for the base item data.
   */
  static defineSchema() {
    const commonData = super.defineSchema();
    return {
      ...commonData,
      disabled: new fields.BooleanField({
        initial: false,
        label: "Disabled",
      }),
      updateCounter: new fields.BooleanField({
        initial: false,
        label: "Update Counter",
      }),
    };
  }
}
