import { mixClasses } from "../../../../helpers/construction.mjs";
import { makeIcon, objectMap } from "../../../../helpers/utils.mjs";
import { combatExpirationMethodField } from "../../../fields/helpers/builders.mjs";
import * as dataMixins from "../../../shared/mixins/_module.mjs";
import * as systemMixins from "../../mixins/_module.mjs";
import BaseEffectSystem from "../base-effect-system/base-effect-system.mjs";

const { fields } = foundry.data;

/**
 * Condition-specific effect data model.
 *
 * Relevant wiki pages:
 * - [Conditions](https://wiki.teriock.com/index.php/Category:Conditions)
 *
 * @extends {BaseEffectSystem}
 * @extends {Teriock.Models.ConditionSystemData}
 * @mixes CombatExpirableSystem
 * @mixes TransformationSystem
 * @mixes WikiSystem
 */
export default class ConditionSystem
  extends mixClasses(
    BaseEffectSystem,
    systemMixins.CombatExpirableSystemMixin,
    systemMixins.WikiSystemMixin,
    systemMixins.TransformationSystemMixin,
    dataMixins.ThresholdDataMixin,
  )
{
  /** @inheritDoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, { namespace: "Condition", type: "condition" });
  }

  /** @inheritDoc */
  static defineSchema() {
    return foundry.utils.mergeObject(super.defineSchema(), {
      expirations: new fields.SchemaField({ combat: new fields.SchemaField({ what: combatExpirationMethodField() }) }),
    });
  }

  /** @inheritDoc */
  get _displayFields() {
    return ["description"];
  }

  /** @inheritDoc */
  get _embedIcons() {
    return [{
      action: "removeConditionDoc",
      icon: "dice-d4",
      tooltip: _loc("TERIOCK.SYSTEMS.Condition.EMBED.rollToRemove"),
      visible: true,
      onClick: async () => this.parent.use(),
    }];
  }

  /**
   * A key corresponding to this condition.
   * @returns {string}
   */
  get conditionKey() {
    return foundry.utils.invertObject(objectMap(TERIOCK.data.conditions, (c) => c._id))[this.parent.id];
  }

  /** @inheritDoc */
  get embedParts() {
    return Object.assign(super.embedParts, { subtitle: "" });
  }

  /** @inheritDoc */
  get useText() {
    return _loc("TERIOCK.SYSTEMS.Condition.USAGE.use", { value: this.parent.name });
  }

  /** @inheritDoc */
  async _preCreate(data, options, user) {
    const yes = await super._preCreate(data, options, user);
    if (yes === false) { return false; }

    if (data.disabled === true) { return false; }
  }

  /** @inheritDoc */
  async _preUpdate(changes, options, user) {
    const yes = await super._preUpdate(changes, options, user);
    if (yes === false) { return false; }

    if (changes.disabled === true) { return false; }
  }

  /** @inheritDoc */
  async _use(_options = {}) {
    if (this.parent.id.includes("dead") && this.parent.actor) { await this.parent.actor.system.deathBagPull(); }
    else { await this.inCombatExpiration(true); }
  }

  /** @inheritDoc */
  async expire() {
    const actor = this.actor;
    const key = this.conditionKey;
    await super.expire();
    await actor?.toggleStatusEffect(key, { active: false });
  }

  /**
   * @inheritDoc
   */
  getCardContextMenuEntries(_doc) {
    return [{
      group: "usage",
      icon: makeIcon(this.useIcon, "contextMenu"),
      label: this.useText,
      onClick: this.use.bind(this),
      visible: this.parent.isOwner,
    }];
  }

  /** @inheritDoc */
  prepareBaseData() {
    super.prepareBaseData();
    this.parent.disabled = false;
  }
}
