import { mergeMetadata } from "../../../../helpers/construction.mjs";
import { TypedIdentifierField } from "../../../fields/_module.mjs";
import { BaseAutomation } from "../abstract/_module.mjs";

export default class SuppressAutomation extends BaseAutomation {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.Suppress"];

  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, { type: "suppress" });

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), { identifier: new TypedIdentifierField() });
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["identifier"];
  }
}
