import { mergeMetadata, mixClasses } from "../../../utils/_module.mjs";
import {
  ArmorSuppressionSystemMixin,
  CompetenceDisplaySystemMixin,
  MetaphysicsSystemMixin,
} from "../mixins/_module.mjs";
import { BaseItemSystem } from "./abstract/_module.mjs";

/**
 * Sorcery-specific item data model.
 * @extends {BaseItemSystem}
 * @mixes ArmorSuppressionSystem
 * @mixes CompetenceDisplaySystem
 * @mixes MetaphysicsSystem
 */
export default class SorcerySystem
  extends mixClasses(BaseItemSystem, CompetenceDisplaySystemMixin, MetaphysicsSystemMixin, ArmorSuppressionSystemMixin)
{
  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, {
    childTypes: ["ability"],
    icon: TERIOCK.DISPLAY.icons.manifest.document.sorcery,
    img: TERIOCK.DISPLAY.thumbnails.manifest.document.sorcery,
    initialCompetence: 1,
    initialKind: "special",
    tags: { simple: true },
    type: "sorcery",
  });

  /** @inheritDoc */
  get _panelBars() {
    return [this._metaphysicsBar];
  }

  /** @inheritDoc */
  get embedParts() {
    return Object.assign(super.embedParts, { subtitle: _loc(this.constructor.typeLabel) });
  }
}
