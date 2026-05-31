import { BaseDocumentExecution } from "../../../../executions/document-executions/_module.mjs";
import { mixClasses } from "../../../../helpers/construction.mjs";
import * as automations from "../../../pseudo-documents/automations/_module.mjs";
import * as systemMixins from "../../mixins/_module.mjs";
import CleanedEffectSystem from "../cleaned-effect-system.mjs";

/**
 * Resource-specific effect data model.
 * @extends {CleanedEffectSystem}
 * @extends {Teriock.Models.ResourceSystemData}
 * @mixes ConsumableSystem
 * @mixes RevelationSystem
 */
export default class ResourceSystem
  extends mixClasses(CleanedEffectSystem, systemMixins.ConsumableSystemMixin, systemMixins.RevelationSystemMixin)
{
  /** @inheritDoc */
  static get _automationTypes() {
    return [
      ...super._automationTypes,
      automations.TradecraftAutomation,
      automations.CommonOutcomesAutomation,
      automations.CommonMacroAutomation,
      automations.HacksAutomation,
      automations.RollAutomation,
      automations.TakeAutomation,
      automations.UseDocumentsAutomation,
    ];
  }

  /** @inheritDoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, { type: "resource", usable: true });
  }

  /** @inheritDoc */
  async _use(options = {}) {
    await new BaseDocumentExecution(options).execute();
  }

  /** @inheritDoc */
  async getPanelParts() {
    const parts = await super.getPanelParts();
    parts.bars.push(this._consumableBar);
    return parts;
  }
}
