import { quickAddAssociation } from "../../../helpers/html.mjs";
import { docSort } from "../../../helpers/utils.mjs";
import { HierarchyDataMixin } from "../../mixins/_module.mjs";
import { ChildTypeModel } from "../../models/_module.mjs";

const { fields } = foundry.data;

/**
 * Base item data model for all Teriock items.
 * Provides common functionality for disabled state and update tracking.
 * @extends {ChildTypeModel}
 * @mixes HierarchyData
 */
export default class TeriockBaseItemModel extends HierarchyDataMixin(
  ChildTypeModel,
) {
  /** @inheritDoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      childEffectTypes: ["ability", "fluency", "resource"],
      stats: false,
    });
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

  /** @inheritDoc */
  get messageParts() {
    const parts = super.messageParts;
    const fluencies = docSort(
      this.parent.fluencies.filter((f) => f.system.revealed),
    );
    const resources = docSort(
      this.parent.resources.filter((r) => r.system.revealed),
    );
    const bodyParts = docSort(this.parent.getBodyParts());
    const equipment = docSort(this.parent.getEquipment());
    const ranks = docSort(this.parent.getRanks());
    quickAddAssociation(
      fluencies,
      "Fluencies",
      TERIOCK.options.document.fluency.icon,
      parts.associations,
    );
    quickAddAssociation(
      resources,
      "Resources",
      TERIOCK.options.document.resource.icon,
      parts.associations,
    );
    quickAddAssociation(
      bodyParts,
      "Body Parts",
      TERIOCK.options.document.body.icon,
      parts.associations,
    );
    quickAddAssociation(
      equipment,
      "Equipment",
      TERIOCK.options.document.equipment.icon,
      parts.associations,
    );
    quickAddAssociation(
      ranks,
      "Ranks",
      TERIOCK.options.document.rank.icon,
      parts.associations,
    );
    return parts;
  }
}
