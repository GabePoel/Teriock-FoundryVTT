import { IdentifierField } from "../../../fields/_module.mjs";

/**
 * @import { TypeDataModel } from "@common/abstract/_module.mjs";
 */

/**
 * @template {MixinBase<typeof TypeDataModel>} T
 * @param {T} Base
 */
export default function IdentifierSystemMixin(Base) {
  /**
   * @mixin
   * @implements {Teriock.Models.IdentifierSystemData}
   */
  class IdentifierSystem extends /** @type {InitializedDataModel<T, Teriock.Models.IdentifierSystemData>} */ (Base) {
    /** @inheritDoc */
    static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.SYSTEMS.Identifier"];

    /** @inheritDoc */
    static _onChangeCreateDialog(dialog) {
      super._onChangeCreateDialog(dialog);
      const form = dialog.element.querySelector("form");
      const { name } = form.elements;
      const defaultIdentifier = foundry.utils.getDocumentClass(this.metadata.documentName).getIdentifierSlug({
        name: name.value.trim() || name.placeholder,
      });
      if (!form.elements["system.identifier"]) {
        const group = this.schema.fields.identifier.toFormGroup({ hint: "" }, {
          name: "system.identifier",
          reset: defaultIdentifier,
        });
        group.dataset.systemField = "";
        name.closest(".form-group").after(group);
      }
      const identifier = form.elements["system.identifier"];
      identifier.setAttribute("reset", defaultIdentifier);
      (identifier.querySelector("input") ?? identifier).placeholder = defaultIdentifier;
    }

    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), { identifier: new IdentifierField() });
    }

    /** @inheritDoc */
    prepareBaseData() {
      if (!this.identifier) { this.identifier = this.parent.constructor.getIdentifierSlug({ name: this.parent.name }); }
      super.prepareBaseData();
    }
  }

  return IdentifierSystem;
}
