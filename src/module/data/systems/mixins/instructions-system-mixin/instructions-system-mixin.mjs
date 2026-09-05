const { fields } = foundry.data;

/**
 * @import { TypeDataModel } from "@common/abstract/_module.mjs";
 */

/**
 * Add instructions to the system.
 * @template {Constructor<TypeDataModel>} T
 * @param {T} Base
 * @returns {MixinResult<T, InstructionsSystem & Teriock.Models.InstructionsSystemData>}
 */
export default function InstructionsSystemMixin(Base) {
  /**
   * @implements {Teriock.Models.InstructionsSystemData}
   * @mixin
   */
  class InstructionsSystem extends Base {
    /** @inheritDoc */
    static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.SYSTEMS.Instructions"];

    /** @inheritDoc */
    static PRESERVED_PROPERTIES = ["system.instructions", ...(super.PRESERVED_PROPERTIES ?? [])];

    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), {
        gmNotes: new fields.HTMLField({ initial: "" }),
        instructions: new fields.HTMLField({ initial: "" }),
      });
    }

    /**
     * Display field for GM notes.
     * @return {Teriock.Display.DisplayField}
     */
    get _displayFieldGmNotes() {
      return { gmOnly: true, path: "system.gmNotes", styles: [TERIOCK.display.panels.styles.gmNotes] };
    }

    /**
     * Display field for setup instructions.
     * @returns {Teriock.Display.DisplayField}
     */
    get _displayFieldInstructions() {
      return { classes: [TERIOCK.display.panels.styles.instructions, "theme-dark"], path: "system.instructions" };
    }

    /** @inheritDoc */
    get _displayFields() {
      return [...this._displayFieldsFirst, ...super._displayFields.filter(f => !this._isFirstDisplayField(f))];
    }

    /**
     * Display fields that appear first.
     * @return {Teriock.Display.FancyDisplayField)[]}
     */
    get _displayFieldsFirst() {
      return [this._displayFieldInstructions, this._displayFieldGmNotes];
    }

    /**
     * @param {Teriock.Display.DisplayField} field
     * @returns {boolean}
     */
    _isFirstDisplayField(field) {
      return ["system.gmNotes", "system.instructions"].includes(typeof field === "string" ? field : field.path);
    }
  }

  return InstructionsSystem;
}
