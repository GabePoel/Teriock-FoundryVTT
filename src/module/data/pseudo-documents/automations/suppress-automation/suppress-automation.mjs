import { TypedIdentifierField } from "../../../fields/_module.mjs";
import { CritMechanicMixin } from "../../mixins/_module.mjs";
import { BaseAutomation } from "../abstract/_module.mjs";

export default class SuppressAutomation extends CritMechanicMixin(BaseAutomation) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.Suppress"];

  /** @inheritDoc */
  static get metadata() {
    return Object.assign(super.metadata, { type: "suppress" });
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), { identifier: new TypedIdentifierField() });
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["identifier"];
  }
}
