import { BaseDocumentExecution } from "../../../../executions/document-executions/_module.mjs";
import { mix } from "../../../../helpers/construction.mjs";
import * as automations from "../../../pseudo-documents/automations/_module.mjs";
import * as mixins from "../../mixins/_module.mjs";
import BaseEffectSystem from "../base-effect-system/base-effect-system.mjs";

/**
 * Resource-specific effect data model.
 * @extends {BaseEffectSystem}
 * @extends {Teriock.Models.ResourceSystemData}
 * @mixes ConsumableSystem
 * @mixes RevelationSystem
 */
export default class ResourceSystem extends mix(
  BaseEffectSystem,
  mixins.ConsumableSystemMixin,
  mixins.RevelationSystemMixin,
) {
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
      automations.UseExternalDocumentsAutomation,
      automations.UseLocalDocumentsAutomation,
    ];
  }

  /** @inheritDoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      type: "resource",
      usable: true,
    });
  }

  /** @inheritDoc */
  get makeSuppressed() {
    let suppressed = super.makeSuppressed;
    if (!suppressed && this.parent.parent.type === "equipment") {
      suppressed = !this.parent.parent?.system.isAttuned;
    }
    return suppressed;
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
