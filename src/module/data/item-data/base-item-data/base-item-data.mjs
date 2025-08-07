import { ChildDataMixin } from "../../mixins/_module.mjs";

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
   * Metadata for this item.
   *
   * @type {Readonly<Teriock.ItemDataModelMetadata>}
   */
  static metadata;

  /**
   * Get the actor associated with this item data.
   *
   * @returns {TeriockActor}
   */
  get actor() {
    return this.parent.actor;
  }

  /** @inheritDoc */
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

  /**
   * Should an effect embedded in this be forcibly suppressed?
   *
   * @param {Teriock.ID<TeriockEffect>} _id
   * @returns {boolean}
   */
  shouldSuppress(_id) {
    return false;
  }
}
