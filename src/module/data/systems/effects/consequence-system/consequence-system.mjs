import { mergeMetadata, mixClasses } from "../../../../utils/_module.mjs";
import { associationsField } from "../../../fields/tools/builders.mjs";
import { TransformationSystemMixin } from "../../mixins/_module.mjs";
import { ApplicableEffectSystem } from "../abstract/_module.mjs";

/**
 * Effect-specific effect data model.
 * @extends {ApplicableEffectSystem}
 * @mixes TransformationSystem
 */
export default class ConsequenceSystem extends mixClasses(ApplicableEffectSystem, TransformationSystemMixin) {
  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, {
    childTypes: [
      "ability",
      "backstory",
      "blessing",
      "body",
      "curse",
      "equipment",
      "familiar",
      "fluency",
      "pact",
      "power",
      "rank",
      "resource",
      "scar",
      "species",
    ],
    icon: TERIOCK.DISPLAY.icons.manifest.document.consequence,
    img: TERIOCK.DISPLAY.thumbnails.manifest.document.consequence,
    initialKind: "other",
    type: "consequence",
    visibleTypes: [
      "ability",
      "backstory",
      "blessing",
      "body",
      "curse",
      "equipment",
      "familiar",
      "fluency",
      "pact",
      "power",
      "rank",
      "resource",
      "scar",
      "species",
    ],
  });

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
