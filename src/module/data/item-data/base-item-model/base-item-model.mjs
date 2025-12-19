import { mix } from "../../../helpers/utils.mjs";
import * as mixins from "../../mixins/_module.mjs";
import { ChildTypeModel } from "../../models/_module.mjs";

const { fields } = foundry.data;

//noinspection JSClosureCompilerSyntax
/**
 * Base item data model for all Teriock items.
 * Provides common functionality for disabled state and update tracking.
 * @extends {ChildTypeModel}
 * @implements {Teriock.Models.TeriockBaseItemModelInterface}
 * @mixes HierarchyData
 */
export default class TeriockBaseItemModel extends mix(
  ChildTypeModel,
  mixins.HierarchyDataMixin,
) {
  /** @inheritDoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      childEffectTypes: ["ability", "fluency", "resource"],
      stats: false,
      visibleTypes: ["ability", "fluency", "resource"],
    });
  }

  /** @inheritDoc */
  static defineSchema() {
    return foundry.utils.mergeObject(super.defineSchema(), {
      disabled: new fields.BooleanField({
        initial: false,
        label: "Disabled",
      }),
      onUse: new fields.SetField(new fields.DocumentIdField()),
    });
  }

  /** @inheritDoc */
  get displayToggles() {
    return [...super.displayToggles, "system.disabled"];
  }
}
