import { mixClasses } from "../../../../helpers/construction.mjs";
import { omit } from "../../../../helpers/utils.mjs";
import { TypedIdentifierField } from "../../../fields/_module.mjs";
import { CritMechanicMixin, OverrideCompetencePseudoDocumentMixin } from "../../mixins/_module.mjs";
import { BaseAutomation } from "../abstract/_module.mjs";

/**
 * @mixes OverrideCompetenceMechanic
 * @mixes CritMechanic
 */
export default class ChangeCompetenceAutomation
  extends mixClasses(BaseAutomation, CritMechanicMixin, OverrideCompetencePseudoDocumentMixin)
{
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.ChangeCompetence"];

  /** @inheritDoc */
  static get metadata() {
    return Object.assign(super.metadata, { type: "changeCompetence" });
  }

  /** @inheritDoc */
  static defineSchema() {
    return omit(Object.assign(super.defineSchema(), { identifier: new TypedIdentifierField() }), ["setCompetence"]);
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["identifier", "competence.raw"];
  }
}
