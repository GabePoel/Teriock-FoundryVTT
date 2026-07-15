import { omit } from "../../../helpers/utils.mjs";
import { TypedIdentifierField } from "../../fields/_module.mjs";
import { CompetenceMechanicMixin, CritMechanicMixin } from "../mixins/_module.mjs";
import { BaseAutomation } from "./abstract/_module.mjs";

/**
 * @extends {BaseAutomation}
 * @mixes CritMechanic
 * @mixes CompetenceMechanic
 * @property {TypedIdentifier} identifier
 */
export default class ChangeCompetenceAutomation extends CompetenceMechanicMixin(CritMechanicMixin(BaseAutomation)) {
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
    return omit(Object.assign(super.defineSchema(), { identifier: new TypedIdentifierField() }), [
      "overrideCompetence",
    ]);
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["identifier", "competence.raw"];
  }
}
