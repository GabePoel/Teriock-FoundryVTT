import { mergeMetadata, mixClasses } from "../../../../helpers/construction.mjs";
import { omit } from "../../../../helpers/utils.mjs";
import { TypedIdentifierField } from "../../../fields/_module.mjs";
import { OverrideCompetencePseudoDocumentMixin } from "../../mixins/_module.mjs";
import { BaseAutomation } from "../abstract/_module.mjs";

/**
 * @mixes OverrideCompetenceMechanic
 */
export default class ChangeCompetenceAutomation
  extends mixClasses(BaseAutomation, OverrideCompetencePseudoDocumentMixin)
{
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.ChangeCompetence"];

  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, { tags: { passive: true }, type: "changeCompetence" });

  /** @inheritDoc */
  static defineSchema() {
    return omit(Object.assign(super.defineSchema(), { identifier: new TypedIdentifierField() }), ["setCompetence"]);
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["identifier", "competence.raw"];
  }

  /** @inheritDoc */
  _makeFormGroup(path, groupConfig = {}, inputConfig = {}, config = {}) {
    if (path === "identifier") {
      inputConfig.suggestions = this.actor?.previewed.getNames({ filter: d => !d.system?.isBasic });
    }
    return super._makeFormGroup(path, groupConfig, inputConfig, config);
  }
}
