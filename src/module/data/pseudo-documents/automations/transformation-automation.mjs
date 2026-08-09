import { mixClasses } from "../../../helpers/construction.mjs";
import { omit } from "../../../helpers/utils.mjs";
import { automationTransformationFields } from "../../fields/tools/transformation-fields.mjs";
import {
  CritMechanicMixin,
  OverrideCompetenceMechanicMixin,
  SelectionPseudoDocumentMixin,
} from "../mixins/_module.mjs";
import { BaseAutomation } from "./abstract/_module.mjs";

/**
 * @extends {BaseAutomation}
 * @extends {Teriock.Transformation.AutomationTransformationConfig}
 * @mixes CritMechanic
 * @mixes SelectionPseudoDocument
 * @mixes OverrideCompetenceMechanic
 */
export default class TransformationAutomation
  extends mixClasses(BaseAutomation, CritMechanicMixin, SelectionPseudoDocumentMixin, OverrideCompetenceMechanicMixin)
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
    return Object.assign(
      omit(super.defineSchema(), [
        "expandFolders",
        "expandTables",
        "localIdentifiers",
        "localQualifier",
        "localUuids",
        "makeSeparateActivations",
        "selectInExecution",
      ]),
      automationTransformationFields(),
    );
  }

  /** @inheritDoc */
  get _formPaths() {
    const paths = [
      ...this._selectionPaths,
      "hr",
      ...this._competencePaths,
      "hr",
      "level",
      "reset",
      "suppress",
      "override",
    ];
    if (this.override.has("art")) {
      paths.push(...["ring", "img", "ringImg"]);
    }
    return paths;
  }

  /** @inheritDoc */
  async getSelectableDocuments(overrides = {}) {
    const out = await super.getSelectableDocuments(overrides);
    const species = out.filter(d => d.type === "species");
    for (const a of out.filter(d => d.documentName === "Actor")) { species.push(...a.species); }
    return species;
  }
}
