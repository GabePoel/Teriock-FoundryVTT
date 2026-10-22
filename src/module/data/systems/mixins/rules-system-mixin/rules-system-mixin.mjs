import { toKebabCase } from "../../../../utils/_module.mjs";
import { IdentifierField } from "../../../fields/_module.mjs";

/**
 * @import { TypeDataModel } from "@common/abstract/_module.mjs";
 */

/**
 * @template {MixinBase<typeof TypeDataModel>} T
 * @param {T} Base
 */
export default function RulesSystemMixin(Base) {
  /**
   * @mixin
   * @implements {Teriock.Models.RulesSystemData}
   */
  class RulesSystem extends /** @type {InitializedDataModel<T, Teriock.Models.RulesSystemData>} */ (Base) {
    /** @inheritDoc */
    static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.SYSTEMS.Rules"];

    /** @inheritDoc */
    static _onChangeCreateDialog(dialog) {
      super._onChangeCreateDialog(dialog);
      const form = dialog.element.querySelector("form");
      const { name } = form.elements;
      const defaultIdentifier = toKebabCase(name.value.trim() || name.placeholder);
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
      identifier.querySelector("input").placeholder = defaultIdentifier;
    }

    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), { identifier: new IdentifierField() });
    }
  }

  return RulesSystem;
}
