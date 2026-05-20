import { ChildSystemMixin } from "../../mixins/_module.mjs";

const { fields } = foundry.data;
const { TypeDataModel } = foundry.abstract;

/**
 * Base item data model for all Teriock items.
 * Provides common functionality for disabled state and update tracking.
 * @extends {TypeDataModel}
 * @extends {Teriock.Models.BaseItemSystemData}
 * @mixes ChildSystem
 */
export default class BaseItemSystem extends ChildSystemMixin(TypeDataModel) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.SYSTEMS.BaseItem"];

  /** @inheritDoc */
  static PRESERVED_PROPERTIES = ["effects", "system.disabled", ...super.PRESERVED_PROPERTIES];

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
      disabled: new fields.BooleanField(),
      flaws: new fields.HTMLField({ initial: "" }),
    });
  }

  /** @inheritDoc */
  get displayFields() {
    return ["system.description", "system.flaws"];
  }

  /** @inheritDoc */
  get displayToggles() {
    return [...super.displayToggles, "system.disabled"];
  }
}
