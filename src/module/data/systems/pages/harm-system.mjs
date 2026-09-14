import { mergeMetadata, mixClasses } from "../../../helpers/construction.mjs";
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
