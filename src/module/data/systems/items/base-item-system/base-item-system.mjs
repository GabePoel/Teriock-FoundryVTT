import { mixClasses } from "../../../../helpers/construction.mjs";
import { nullIdField } from "../../../fields/tools/builders.mjs";
import { ChildSystemMixin, InstructionsSystemMixin } from "../../mixins/_module.mjs";

const { fields } = foundry.data;
const { TypeDataModel } = foundry.abstract;

/**
 * Base item data model.
 * @mixes InstructionsSystem
 * @mixes ChildSystem
 */
export default class BaseItemSystem
  extends mixClasses(TypeDataModel, ChildSystemMixin, InstructionsSystemMixin)
{
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.SYSTEMS.BaseItem"];

  /** @inheritDoc */
  static PRESERVED_PROPERTIES = ["effects", "system.disabled", "system._dep", ...super.PRESERVED_PROPERTIES];

  /** @inheritDoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      childTypes: ["ability", "fluency", "resource"],
      disabledPath: "system.disabled",
      visibleTypes: ["ability", "fluency", "resource"],
    });
  }

  /** @inheritDoc */
  static defineSchema() {
    return foundry.utils.mergeObject(super.defineSchema(), {
      _dep: nullIdField(),
      disabled: new fields.BooleanField(),
      flaws: new fields.HTMLField({ initial: "" }),
    });
  }

  /** @inheritDoc */
  static migrateData(source, options) {
    if (source._dep?.length !== 16) { delete source._dep; }
    return super.migrateData(source, options);
  }

  /** @inheritDoc */
  get _displayFields() {
    return [this._displayFieldInstructions, "system.description", "system.flaws"];
  }

  /** @inheritDoc */
  get _displayToggles() {
    return [...super._displayToggles, "system.disabled"];
  }

  /** @inheritDoc */
  _getTipSuppressions() {
    return { ...super._getTipSuppressions(), dependee: this._isSuppressedDependee.bind(this) };
  }

  /**
   * If this is suppressed due to its dependee being inactive.
   * @returns {boolean}
   */
  _isSuppressedDependee() {
    return this.parent.dependee?.active === false;
  }
}
