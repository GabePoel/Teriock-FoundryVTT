import { omit } from "../../../helpers/utils.mjs";
import { TypedIdentifierField } from "../../fields/_module.mjs";
import { CritAutomation } from "./abstract/_module.mjs";
import * as automationMixins from "./mixins/_module.mjs";

/**
 * @extends {CritAutomation}
 * @mixes CompetenceAutomation
 * @property {TypedIdentifier} identifier
 */
export default class ChangeCompetenceAutomation extends automationMixins.CompetenceAutomationMixin(CritAutomation) {
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
