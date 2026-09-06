import { mixClasses } from "../../../../helpers/construction.mjs";
import { associationsField } from "../../../fields/tools/builders.mjs";
import { TransformationSystemMixin } from "../../mixins/_module.mjs";
import ApplicableEffectSystem from "../applicable-effect-system/applicable-effect-system.mjs";

/**
 * Effect-specific effect data model.
 * @mixes TransformationSystem
 */
export default class ConsequenceSystem extends mixClasses(ApplicableEffectSystem, TransformationSystemMixin) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.SYSTEMS.Consequence"];

  /** @inheritDoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      childTypes: ["ability", "body", "equipment", "fluency", "power", "rank", "resource", "species"],
      initialKind: "other",
      type: "consequence",
      visibleTypes: ["ability", "body", "equipment", "fluency", "power", "rank", "resource", "species"],
    });
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), { associations: associationsField() });
  }

  /** @inheritDoc */
  async getPanelParts() {
    const parts = await super.getPanelParts();
    parts.associations.push(...this.associations);
    return parts;
  }
}
