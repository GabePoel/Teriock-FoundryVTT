import { mix } from "../../../helpers/utils.mjs";
import { CritAutomation } from "./abstract/_module.mjs";
import {
  CompetenceAutomationMixin,
  ExternalDocumentsAutomationMixin,
  OverrideDataAutomationMixin,
} from "./mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * @param {boolean} attachDocuments
 * @extends {CritAutomation}
 * @mixes ExternalDocumentsAutomation
 * @mixes CompetenceAutomation
 * @mixes OverrideDataAutomation
 */
export default class AddExternalDocumentsAutomation extends mix(
  CritAutomation,
  ExternalDocumentsAutomationMixin,
  CompetenceAutomationMixin,
  OverrideDataAutomationMixin,
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
    return [
      ...super._formPaths,
      ...super._selectionPaths,
      "attachDocuments",
      ...super._overrideDataPaths,
    ];
  }

  /**
   * @inheritDoc
   * @return {Promise<Teriock.System.Attachment<ChildDocument>[]>}
   */
  async choose() {
    const uuids = await super.choose();
    return uuids.map((uuid) => {
      const data = foundry.utils.expandObject({
        "system.competence.raw": this.overrideCompetence
          ? this.competence.raw
          : this.document?.system?.competence?.value,
      });
      if (this.overrideData && this.data) {
        foundry.utils.mergeObject(data, this.data, { inplace: true });
      }
      return { uuid, data };
    });
  }
}
