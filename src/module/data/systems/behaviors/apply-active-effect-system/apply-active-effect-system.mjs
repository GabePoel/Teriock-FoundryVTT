import { mergeMetadata, mixClasses } from "../../../../utils/_module.mjs";
import { TypedIdentifierSetField } from "../../../fields/_module.mjs";
import { BaseSystemMixin, UncommonSystemMixin } from "../../mixins/_module.mjs";

const { ApplyActiveEffectRegionBehaviorType } = foundry.data.regionBehaviors;

/**
 * @inheritDoc
 * @extends {ApplyActiveEffectRegionBehaviorType}
 * @mixes BaseSystem
 * @mixes UncommonSystem
 */
export default class ApplyActiveEffectSystem
  extends mixClasses(ApplyActiveEffectRegionBehaviorType, BaseSystemMixin, UncommonSystemMixin)
{
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = ApplyActiveEffectRegionBehaviorType.LOCALIZATION_PREFIXES;

  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, { documentName: "RegionBehavior", type: "applyActiveEffect" });

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      identifiers: new TypedIdentifierSetField({
        hint: "TERIOCK.SCHEMA.EffectIdentifiers.hint",
        label: "TERIOCK.SCHEMA.EffectIdentifiers.label",
        types: ActiveEffect.implementation.TYPES.filter(t => t !== "base"),
      }),
    });
  }

  /** @inheritDoc */
  static registerModel() {
    CONFIG.RegionBehavior.dataModels[this.metadata.type] = this;
  }

  /** @inheritDoc */
  prepareBaseData() {
    super.prepareBaseData();
    this.prepareIdentifiersData();
  }

  /**
   * Data preparation that depends on the identifiers registry.
   */
  prepareIdentifiersData() {
    for (const identifier of this.identifiers) {
      const uuid = game.teriock.identifiers.get(identifier);
      if (uuid) { this.effects.add(uuid); }
    }
  }
}
