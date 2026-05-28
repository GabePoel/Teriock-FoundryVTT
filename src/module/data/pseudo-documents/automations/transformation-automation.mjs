import { mixClasses } from "../../../helpers/construction.mjs";
import { automationTransformationFields } from "../../fields/helpers/transformation-fields.mjs";
import { CritAutomation } from "./abstract/_module.mjs";
import { CompetenceAutomationMixin, SelectExternalDocumentsAutomationMixin } from "./mixins/_module.mjs";

/**
 * @extends {CritAutomation}
 * @extends {AutomationTransformationConfig}
 * @mixes SelectExternalDocumentsAutomation
 * @mixes CompetenceAutomation
 */
export default class TransformationAutomation
  extends mixClasses(CritAutomation, SelectExternalDocumentsAutomationMixin, CompetenceAutomationMixin)
{
  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.AUTOMATIONS.Transformation.LABEL";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "transformation";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), automationTransformationFields());
  }

  /** @inheritDoc */
  get _formPaths() {
    return [
      ...this._selectionPaths,
      "hr",
      ...this._competencePaths,
      "hr",
      "level",
      "img",
      "ring",
      "override",
      "reset",
      "suppress",
    ];
  }

  /** @inheritDoc */
  async getDocuments(options = {}) {
    let out = await super.getDocuments(options);
    const actors = out.filter(d => d.documentName === "Actor");
    out = out.filter(d => d.type === "species");
    for (const a of actors) { out.push(...a.species); }
    return out;
  }
}
