import { mergeMetadata, mixClasses } from "../../../../utils/_module.mjs";
import { IdentifierSetField } from "../../../fields/_module.mjs";
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
      identifiers: new IdentifierSetField({
        hint: "TERIOCK.SCHEMA.EffectIdentifiers.hint",
        label: "TERIOCK.SCHEMA.EffectIdentifiers.label",
        types: ActiveEffect.implementation.TYPES.filter(t => t !== "base"),
      }),
    });
  }

  /** @inheritDoc */
  static registerModel() {
    // This is overridden so that we can keep the default hint/label/icon.
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

// Make sure that identifiers are ready.
Hooks.once("teriock.identifiersInit", () => {
  for (const s of game.scenes) {
    for (const r of s.regions) { r.behaviors.forEach(b => b.system.prepareIdentifiersData?.()); }
  }
});

// If a behavior is updated to give different active effects it shouldn't dump them on an unqualified actor.
// This is kind of hacky and only needed because we use qualifiers to filter tokens.
Hooks.on("preCreateActiveEffect", effect => {
  if (!effect.origin?.includes(".RegionBehavior.")) { return; }
  const behavior = fromUuidSync(effect.origin);
  if (behavior?.type !== "applyActiveEffect") { return; }
  const token = Array.from(behavior.region?.tokens ?? []).find(t => t.actor === effect.actor);
  if (!behavior.checkQualifier(token)) { return false; }
});
