import { CritAutomation } from "./abstract/_module.mjs";
import { ExternalDocumentsAutomationMixin } from "./mixins/_module.mjs";

export default class AddExternalDocumentsAutomation extends ExternalDocumentsAutomationMixin(
  CritAutomation,
) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "TERIOCK.AUTOMATIONS.AddExternalDocumentsAutomation",
  ];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.AUTOMATIONS.AddExternalDocumentsAutomation.LABEL";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "addExternal";
  }
}
