import { mergeMetadata, mixClasses } from "../../../helpers/construction.mjs";
import * as automations from "../../pseudo-documents/automations/_module.mjs";
import { ConsumableSystemMixin, RevelationSystemMixin } from "../mixins/_module.mjs";
import CleanedEffectSystem from "./cleaned-effect-system.mjs";

/**
 * Resource-specific effect data model.
 * @mixes ConsumableSystem
 * @mixes RevelationSystem
 */
export default class ResourceSystem
  extends mixClasses(CleanedEffectSystem, ConsumableSystemMixin, RevelationSystemMixin)
{
  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, { tags: { usable: true }, type: "resource" });

  /** @inheritDoc */
  static get _automationTypes() {
    return [
      ...super._automationTypes,
      automations.TradecraftAutomation,
      automations.CommonOutcomesAutomation,
      automations.MacroAutomation,
      automations.CoverAutomation,
      automations.HacksAutomation,
      automations.RollAutomation,
      automations.TakeAutomation,
      automations.UseDocumentsAutomation,
    ];
  }

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
