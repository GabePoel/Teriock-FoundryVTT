import { mix } from "../../../../helpers/utils.mjs";
import { TextField } from "../../../fields/_module.mjs";
import { ChildSystem } from "../../abstract/_module.mjs";
import * as mixins from "../../mixins/_module.mjs";

const { fields } = foundry.data;

//noinspection JSClosureCompilerSyntax
/**
 * Base item data model for all Teriock items.
 * Provides common functionality for disabled state and update tracking.
 * @extends {ChildSystem}
 * @implements {Teriock.Models.BaseItemSystemInterface}
 * @mixes HierarchySystem
 */
export default class BaseItemSystem extends mix(
  ChildSystem,
  mixins.HierarchySystemMixin,
) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "TERIOCK.SYSTEMS.BaseItem",
  ];

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
      }),
      flaws: new TextField({ initial: "" }),
      onUse: new fields.SetField(new fields.DocumentIdField()),
    });
  }

  /** @inheritDoc */
  get displayToggles() {
    return [...super.displayToggles, "system.disabled"];
  }
}
