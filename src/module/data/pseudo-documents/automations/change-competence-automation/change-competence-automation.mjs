import { omit } from "../../../../helpers/utils.mjs";
import { TypedIdentifierField } from "../../../fields/_module.mjs";
import { CritMechanicMixin, OverrideCompetencePseudoDocumentMixin } from "../../mixins/_module.mjs";
import { BaseAutomation } from "../abstract/_module.mjs";

/**
 * @mixes OverrideCompetenceMechanic
 * @mixes CritMechanic
 */
export default class ChangeCompetenceAutomation
  extends OverrideCompetencePseudoDocumentMixin(CritMechanicMixin(BaseAutomation))
{
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.ChangeCompetence"];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.AUTOMATIONS.ChangeCompetence.LABEL";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "changeCompetence";
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
