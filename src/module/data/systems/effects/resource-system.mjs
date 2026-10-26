import { mergeMetadata, mixClasses } from "../../../utils/_module.mjs";
import { ConsumableSystemMixin, MetaphysicsSystemMixin, RevelationSystemMixin } from "../mixins/_module.mjs";
import CleanedEffectSystem from "./cleaned-effect-system.mjs";

/**
 * Resource-specific effect data model.
 * @extends {CleanedEffectSystem}
 * @mixes ConsumableSystem
 * @mixes MetaphysicsSystem
 * @mixes RevelationSystem
 */
export default class ResourceSystem
  extends mixClasses(CleanedEffectSystem, ConsumableSystemMixin, MetaphysicsSystemMixin, RevelationSystemMixin)
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
  get _panelBars() {
    return [this._metaphysicsBar, this._consumableBar];
  }

  /** @inheritDoc */
  get isPassive() {
    return false;
  }
}
