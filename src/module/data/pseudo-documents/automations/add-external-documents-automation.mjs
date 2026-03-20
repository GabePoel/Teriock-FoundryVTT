import { CritAutomation } from "./abstract/_module.mjs";
import { ExternalDocumentsAutomationMixin } from "./mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * @param {boolean} attachDocuments
 */
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

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      attachDocuments: new fields.BooleanField({ initial: true }),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    return [...super._formPaths, "attachDocuments"];
  }
}
