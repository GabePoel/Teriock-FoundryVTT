import { mixClasses } from "../../../helpers/construction.mjs";
import { automationTransformationFields } from "../../fields/tools/transformation-fields.mjs";
import { CritMechanicMixin } from "../mixins/_module.mjs";
import { BaseAutomation } from "./abstract/_module.mjs";
import * as automationMixins from "./mixins/_module.mjs";

/**
 * @extends {BaseAutomation}
 * @mixes CritMechanic
 * @extends {Teriock.Transformation.AutomationTransformationConfig}
 * @mixes SelectExternalDocumentsAutomation
 * @mixes CompetenceAutomation
 */
export default class TransformationAutomation
  extends mixClasses(
    CritMechanicMixin(BaseAutomation),
    automationMixins.SelectExternalDocumentsAutomationMixin,
    automationMixins.CompetenceAutomationMixin,
  )
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
