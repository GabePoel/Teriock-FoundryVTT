import { mixClasses } from "../../../helpers/construction.mjs";
import { toCamelCase } from "../../../helpers/string.mjs";
import * as automations from "../../pseudo-documents/automations/_module.mjs";
import { AutomatableSystemMixin, MetaphysicsSystemMixin, WikiSystemMixin } from "../mixins/_module.mjs";
import BasePageSystem from "./base-page-system/base-page-system.mjs";

/**
 * @mixes AutomatableSystem
 * @mixes MetaphysicsSystem
 * @mixes WikiSystem
 */
export default class HarmSystem
  extends mixClasses(BasePageSystem, AutomatableSystemMixin, MetaphysicsSystemMixin, WikiSystemMixin)
{
  /** @inheritDoc */
  static get _automationTypes() {
    return [
      automations.AddDocumentsAutomation,
      automations.AttackAutomation,
      automations.AttunementAutomation,
      automations.ChangeMovementAutomation,
      automations.ChatMacroAutomation,
      automations.ChatStatusAutomation,
      automations.CommonOutcomesAutomation,
      automations.CoverAutomation,
      automations.FeatAutomation,
      automations.HacksAutomation,
      automations.HealAutomation,
      automations.RegionAutomation,
      automations.ResistAutomation,
      automations.RevitalizeAutomation,
      automations.RollAutomation,
      automations.RollStyleAutomation,
      automations.SummonAutomation,
      automations.TakeAutomation,
      automations.TradecraftAutomation,
      automations.UseDocumentsAutomation,
    ];
  }

  /** @inheritDoc */
  get _panelBars() {
    return [this._metaphysicsBar];
  }

  /** @inheritDoc */
  get wikiPage() {
    return `${this.parent.type.capitalize()}:${TERIOCK.index.damageTypes[toCamelCase(this.identifier ?? "")] ?? ""}`;
  }

  /** @inheritDoc */
  async _preCreate(data, options, user) {
    const yes = await super._preCreate(data, options, user);
    if (yes === false) { return false; }

    this.parent.updateSource(
      foundry.utils.mergeObject(
        { system: { effectTypes: [this.parent.type === "damage" ? "damaging" : "draining"] } },
        data,
      ),
    );
  }
}
