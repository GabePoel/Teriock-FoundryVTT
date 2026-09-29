import { mergeMetadata, mixClasses } from "../../../helpers/construction.mjs";
import * as automations from "../../pseudo-documents/automations/_module.mjs";
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
  static metadata = mergeMetadata(super.metadata, { crit: { enabled: true, where: "chatData" } });

  /** @inheritDoc */
  static get _automationTypes() {
    return [...super._automationTypes, ...this._activationAutomationTypes, automations.RollStyleAutomation];
  }

  /** @inheritDoc */
  get _panelBars() {
    return [this._metaphysicsBar];
  }

  /** @inheritDoc */
  get makesChatData() {
    return true;
  }
}
