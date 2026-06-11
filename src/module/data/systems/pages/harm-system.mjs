import { icons } from "../../../constants/display/icons.mjs";
import { mixClasses } from "../../../helpers/construction.mjs";
import { simplifyTags } from "../../../helpers/panel.mjs";
import { toCamelCase } from "../../../helpers/string.mjs";
import * as automations from "../../pseudo-documents/automations/_module.mjs";
import * as systemMixins from "../mixins/_module.mjs";
import BasePageSystem from "./base-page-system/base-page-system.mjs";

/**
 * @extends {BasePageSystem}
 * @mixes AutomatableSystem
 * @mixes MetaphysicsSystem
 * @mixes WikiSystem
 */
export default class HarmSystem
  extends mixClasses(
    BasePageSystem,
    systemMixins.AutomatableSystemMixin,
    systemMixins.MetaphysicsSystemMixin,
    systemMixins.WikiSystemMixin,
  )
{
  /** @inheritDoc */
  static get _automationTypes() {
    return [
      automations.AddDocumentsAutomation,
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
    return [{
      icon: icons.form.normal,
      label: _loc("TERIOCK.SYSTEMS.Ability.PANELS.metaphysics"),
      wrappers: simplifyTags(this._metaphysicsTags),
    }];
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
