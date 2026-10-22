import { mergeMetadata, mixClasses } from "../../../utils/_module.mjs";
import { ConsumableSystemMixin, RevelationSystemMixin } from "../mixins/_module.mjs";
import CleanedEffectSystem from "./cleaned-effect-system.mjs";

/**
 * Resource-specific effect data model.
 * @extends {CleanedEffectSystem}
 * @mixes ConsumableSystem
 * @mixes RevelationSystem
 */
export default class ResourceSystem
  extends mixClasses(CleanedEffectSystem, ConsumableSystemMixin, RevelationSystemMixin)
{
  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, {
    automationTags: { triggered: true },
    icon: TERIOCK.DISPLAY.icons.manifest.document.resource,
    img: TERIOCK.DISPLAY.thumbnails.manifest.document.resource,
    kinds: _replace(TERIOCK.CONFIG.effect.kind),
    tags: { usable: true },
    type: "resource",
  });

  /** @inheritDoc */
  get isPassive() {
    return false;
  }

  /** @inheritDoc */
  async getPanelParts() {
    const parts = await super.getPanelParts();
    parts.bars.push(this._consumableBar);
    return parts;
  }
}
