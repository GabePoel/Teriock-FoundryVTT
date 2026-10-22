import { mergeMetadata, mixClasses } from "../../../utils/_module.mjs";
import { AutomatableSystemMixin, MetaphysicsSystemMixin, WikiSystemMixin } from "../mixins/_module.mjs";
import BasePageSystem from "./base-page-system/base-page-system.mjs";

/**
 * @extends {BasePageSystem}
 * @mixes AutomatableSystem
 * @mixes MetaphysicsSystem
 * @mixes WikiSystem
 */
export default class HarmSystem
  extends mixClasses(BasePageSystem, AutomatableSystemMixin, MetaphysicsSystemMixin, WikiSystemMixin)
{
  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, {
    automationTags: { harm: true, triggered: true },
    crit: { enabled: true, where: "chatData" },
  });

  /** @inheritDoc */
  get _panelBars() {
    return [this._metaphysicsBar];
  }

  /** @inheritDoc */
  get makesChatData() {
    return true;
  }
}
