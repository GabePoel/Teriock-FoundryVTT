import { docSort, mergeFreeze } from "../../../helpers/utils.mjs";
import { ChildTypeModel } from "../../models/_module.mjs";

const { fields } = foundry.data;

/**
 * Base item data model for all Teriock items.
 * Provides common functionality for disabled state and update tracking.
 */
export default class TeriockBaseItemModel extends ChildTypeModel {
  /**
   * @inheritDoc
   * @type {Readonly<Teriock.Documents.ItemModelMetadata>}
   */
  static metadata = mergeFreeze(
    /** @type {Teriock.Documents.ItemModelMetadata} */
    (super.metadata),
    {
      childEffectTypes: ["ability", "fluency", "resource"],
      collection: "items",
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

  /** @inheritDoc */
  get messageParts() {
    const parts = super.messageParts;
    const fluencies = docSort(this.parent.fluencies);
    const resources = docSort(this.parent.resources);
    if (fluencies.length > 0) {
      parts.associations.push({
        title: "Fluencies",
        icon: TERIOCK.options.document.fluency.icon,
        cards: fluencies.map((f) => {
          return {
            id: f.id,
            img: f.img,
            name: f.system.nameString,
            type: f.type,
            uuid: f.uuid,
          };
        }),
      });
    }
    if (resources.length > 0) {
      parts.associations.push({
        title: "Resources",
        icon: TERIOCK.options.document.resource.icon,
        cards: resources.map((r) => {
          return {
            id: r.id,
            img: r.img,
            name: r.system.nameString,
            type: r.type,
            uuid: r.uuid,
          };
        }),
      });
    }
    return parts;
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
