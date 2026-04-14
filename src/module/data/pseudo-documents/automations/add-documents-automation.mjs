import { mix } from "../../../helpers/construction.mjs";
import { CritAutomation } from "./abstract/_module.mjs";
import {
  CompetenceAutomationMixin,
  OverrideDataAutomationMixin,
  SelectDocumentsAutomationMixin,
} from "./mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * @param {boolean} attachDocuments
 * @extends {CritAutomation}
 * @mixes SelectDocumentsAutomation
 * @mixes CompetenceAutomation
 * @mixes OverrideDataAutomation
 */
export default class AddDocumentsAutomation extends mix(
  CritAutomation,
  SelectDocumentsAutomationMixin,
  CompetenceAutomationMixin,
  OverrideDataAutomationMixin,
) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "TERIOCK.AUTOMATIONS.AddDocuments",
  ];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.AUTOMATIONS.AddDocuments.LABEL";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "addDocuments";
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
      ...this._selectionPaths,
      "hr",
      "attachDocuments",
      ...this._competencePaths,
      ...super._overrideDataPaths,
    ];
  }

  /**
   * @inheritDoc
   * @param {object} [options]
   * @param {AnyActor} [options.actor]
   * @return {Promise<Teriock.System.Attachment<ChildDocument>[]>}
   */
  async choose(options = {}) {
    const uuids = await super.choose(options);
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

  /** @inheritDoc */
  async getDocuments(options = {}) {
    return (await super.getDocuments(options)).filter((d) => d && d.uuid);
  }
}
