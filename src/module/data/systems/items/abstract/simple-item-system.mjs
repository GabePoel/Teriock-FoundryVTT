import { mergeMetadata, mixClasses } from "../../../../utils/_module.mjs";
import { CompetenceDisplaySystemMixin, MetaphysicsSystemMixin, StatGiverSystemMixin } from "../../mixins/_module.mjs";
import BaseItemSystem from "./base-item-system/base-item-system.mjs";

/**
 * Shared data model for items that are simple collections of effects.
 * @extends {BaseItemSystem}
 * @mixes CompetenceDisplaySystem
 * @mixes MetaphysicsSystem
 * @mixes StatGiverSystem
 */
export default class SimpleItemSystem
  extends mixClasses(BaseItemSystem, CompetenceDisplaySystemMixin, MetaphysicsSystemMixin, StatGiverSystemMixin)
{
  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, { tags: { simple: true } });

  /** @inheritDoc */
  static get _initialStatPoolFormula() {
    return "";
  }

  /** @inheritDoc */
  get _panelBars() {
    return [this._statBar, this._metaphysicsBar];
  }

  /** @inheritDoc */
  get embedParts() {
    return Object.assign(super.embedParts, { subtitle: _loc(this.constructor.typeLabel) });
  }
}
