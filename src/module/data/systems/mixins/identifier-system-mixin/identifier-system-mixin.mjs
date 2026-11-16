import { SlugField } from "../../../fields/_module.mjs";
import { migrateRename } from "../../../fields/tools/migrations.mjs";

/**
 * @import { TypeDataModel } from "@common/abstract/_module.mjs";
 */

/**
 * @template {MixinBase<typeof TypeDataModel>} T
 * @param {T} Base
 * @category Identifiers
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
      const defaultSlug = foundry.utils.getDocumentClass(this.metadata.documentName).getIdentifierSlug({
        name: name.value.trim() || name.placeholder,
      });
      if (!form.elements["system.slug"]) {
        const group = this.schema.fields.slug.toFormGroup({ hint: "" }, { name: "system.slug", reset: defaultSlug });
        group.dataset.systemField = "";
        name.closest(".form-group").after(group);
      }
      const slug = form.elements["system.slug"];
      slug.setAttribute("reset", defaultSlug);
      (slug.querySelector("input") ?? slug).placeholder = defaultSlug;
    }

    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), { slug: new SlugField() });
    }

    /** @inheritDoc */
    static migrateData(source, options) {
      migrateRename(source, "identifier", "slug");
      return super.migrateData(source, options);
    }

    /** @inheritDoc */
    prepareBaseData() {
      if (!this.slug) { this.slug = this.parent.constructor.getIdentifierSlug({ name: this.parent.name }); }
      super.prepareBaseData();
    }
  }

  return IdentifierSystem;
}
