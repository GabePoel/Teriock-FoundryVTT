import { mergeMetadata } from "../../../../helpers/construction.mjs";
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
    static metadata = mergeMetadata(super.metadata, {
      preserveOnRefresh: ["system.gmNotes", "system.instructions", ...super.metadata.preserveOnRefresh],
    });

    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), {
        gmNotes: new fields.HTMLField(),
        instructions: new fields.HTMLField(),
      });
    }

    /** @inheritDoc */
    get _displayFieldsImportant() {
      return [{ classes: [TERIOCK.display.panels.styles.instructions, "theme-dark"], path: "system.instructions" }, {
        classes: [TERIOCK.display.panels.styles.gmNotes],
        gmOnly: true,
        path: "system.gmNotes",
      }, ...super._displayFieldsImportant];
    }
  }

  return InstructionsSystem;
}
