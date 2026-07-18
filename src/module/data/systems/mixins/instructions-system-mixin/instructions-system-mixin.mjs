const { fields } = foundry.data;

/**
 * Add instructions to the system.
 * @param {typeof TypeDataModel} Base
 */
export default function InstructionsSystemMixin(Base) {
  return (
    /**
     * @extends {Teriock.Models.InstructionsSystemData}
     * @mixin
     */
    class InstructionsSystem extends Base {
      /** @inheritDoc */
      static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.SYSTEMS.Instructions"];

      /** @inheritDoc */
      static PRESERVED_PROPERTIES = ["system.instructions", ...(super.PRESERVED_PROPERTIES ?? [])];

      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), { instructions: new fields.HTMLField({ initial: "" }) });
      }

      /**
       * Display field for setup instructions.
       * @returns {Teriock.Display.DisplayField}
       */
      get _displayFieldInstructions() {
        return { classes: `${TERIOCK.display.panel.classes.instructions} theme-dark`, path: "system.instructions" };
      }

      /** @inheritDoc */
      get _displayFields() {
        return [this._displayFieldInstructions, ...super._displayFields.filter(f => !this.isInstructionsField(f))];
      }

      /**
       * @param {Teriock.Display.DisplayField} field
       * @returns {boolean}
       */
      isInstructionsField(field) {
        return (typeof field === "string" ? field : field.path) === "system.instructions";
      }
    }
  );
}
