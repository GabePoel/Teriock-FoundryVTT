import { dotJoin, mixClasses } from "../../../../utils/_module.mjs";
import { ArmorSuppressionSystemMixin, AttunableSystemMixin } from "../../mixins/_module.mjs";
import SimpleItemSystem from "./simple-item-system.mjs";

/**
 * Shared data model for simple items that represent contracts.
 * @extends {SimpleItemSystem}
 * @mixes ArmorSuppressionSystem
 * @mixes AttunableSystem
 */
export default class ContractItemSystem
  extends mixClasses(SimpleItemSystem, ArmorSuppressionSystemMixin, AttunableSystemMixin)
{
  /** @inheritDoc */
  static get _initialNeedsAttunement() {
    return false;
  }

  /** @inheritDoc */
  get _displayTags() {
    return [...super._displayTags, ...this._attunableTags];
  }

  /** @inheritDoc */
  get _panelBars() {
    const bars = super._panelBars;
    if (this._shouldShowTierWrapper) { bars.push(this._attunableBar); }
    return bars;
  }

  /** @inheritDoc */
  get embedParts() {
    const parts = super.embedParts;
    return Object.assign(parts, { text: dotJoin([...this._attunableWrappers, parts.text]) });
  }

  /** @inheritDoc */
  async _preCreate(data, options, user) {
    const yes = await super._preCreate(data, options, user);
    if (yes === false) { return false; }

    this.parent.updateSource(foundry.utils.mergeObject({ system: { effectTypes: ["contract"] } }, data));
  }
}
