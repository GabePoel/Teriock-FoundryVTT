import { mix } from "../../../../helpers/construction.mjs";
import { associationsField } from "../../../fields/helpers/builders.mjs";
import * as mixins from "../../mixins/_module.mjs";
import ImbuementSystem from "../imbuement-system/imbuement-system.mjs";

/**
 * Effect-specific effect data model.
 * @extends {ImbuementSystem}
 * @extends {Teriock.Models.ConsequenceSystemData}
 * @mixes TransformationSystem
 */
export default class ConsequenceSystem extends mix(
  ImbuementSystem,
  mixins.TransformationSystemMixin,
) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "TERIOCK.SYSTEMS.Consequence",
  ];

  /** @inheritDoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      childEffectTypes: ["ability", "fluency", "resource"],
      childItemTypes: ["body", "equipment", "power", "rank", "species"],
      type: "consequence",
      visibleTypes: [
        "ability",
        "body",
        "equipment",
        "fluency",
        "power",
        "rank",
        "resource",
        "species",
      ],
    });
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      associations: associationsField(),
    });
  }

  /** @inheritDoc */
  async getPanelParts() {
    const parts = await super.getPanelParts();
    parts.associations.push(...this.associations);
    return parts;
  }
}
