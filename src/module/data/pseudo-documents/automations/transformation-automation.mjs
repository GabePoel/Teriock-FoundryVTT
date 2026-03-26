import { transformationField } from "../../fields/helpers/builders.mjs";
import { CritAutomation } from "./abstract/_module.mjs";
import { ExternalDocumentsAutomationMixin } from "./mixins/_module.mjs";

/**
 * @property {TransformationData} transformation
 */
export default class TransformationAutomation extends ExternalDocumentsAutomationMixin(
  CritAutomation,
) {
  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.AUTOMATIONS.TransformationAutomation.LABEL";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "transformation";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      transformation: transformationField({
        alwaysEnabled: true,
        configuration: true,
      }),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    return [
      ...super._formPaths,
      "transformation.level",
      "transformation.img",
      "transformation.resetHp",
      "transformation.resetMp",
      "transformation.suppression.bodyParts",
      "transformation.suppression.equipment",
      "transformation.suppression.fluencies",
      "transformation.suppression.ranks",
    ];
  }

  /** @inheritDoc */
  async getDocuments(options = {}) {
    let out = await super.getDocuments(options);
    const actors = out.filter((d) => d.documentName === "Actor");
    out = out.filter((d) => d.type === "species");
    for (const a of actors) {
      out.push(...a.species);
    }
    return out;
  }
}
