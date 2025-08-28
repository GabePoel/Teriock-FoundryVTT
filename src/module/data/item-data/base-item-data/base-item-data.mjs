import { mergeFreeze } from "../../../helpers/utils.mjs";
import { ChildTypeModel } from "../../models/_module.mjs";

const { fields } = foundry.data;

/**
 * Base item data model for all Teriock items.
 * Provides common functionality for disabled state and update tracking.
 */
export default class TeriockBaseItemData extends ChildTypeModel {
  /**
   * @inheritDoc
   * @type {Readonly<Teriock.Documents.ItemModelMetadata>}
   */
  static metadata = mergeFreeze(
    /** @type {Teriock.Documents.ItemModelMetadata} */ (super.metadata),
    {
      childEffectTypes: ["ability", "fluency", "resource"],
      stats: false,
    },
  );

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
   * Get the actor associated with this item data.
   * @returns {TeriockActor}
   */
  get actor() {
    return /** @type {TeriockActor} */ this.parent.actor;
  }

  /**
   * Should an effect embedded in this be forcibly suppressed?
   * @param {Teriock.ID<TeriockEffect>} _id
   * @returns {boolean}
   */
  shouldSuppress(_id) {
    return false;
  }
}
