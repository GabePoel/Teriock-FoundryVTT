import { ExpirationExecution } from "../../../../executions/child-executions/_module.mjs";
import { mixClasses } from "../../../../helpers/construction.mjs";
import { makeIcon } from "../../../../helpers/icon.mjs";
import { objectMap } from "../../../../helpers/utils.mjs";
import * as dataMixins from "../../../mixins/_module.mjs";
import * as systemMixins from "../../mixins/_module.mjs";
import BaseEffectSystem from "../base-effect-system/base-effect-system.mjs";

/**
 * Condition-specific effect data model.
 *
 * Relevant wiki pages:
 * - [Conditions](https://wiki.teriock.com/index.php/Category:Conditions)
 *
 * @extends {BaseEffectSystem}
 * @extends {Teriock.Models.ConditionSystemData}
 * @mixes TransformationSystem
 * @mixes WikiSystem
 */
export default class ConditionSystem
  extends mixClasses(
    BaseEffectSystem,
    systemMixins.WikiSystemMixin,
    systemMixins.TransformationSystemMixin,
    dataMixins.ThresholdDataMixin,
  )
{
  /** @inheritDoc */
  static Execution = ExpirationExecution;

  /** @inheritDoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, { namespace: "Condition", type: "condition" });
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

    // If this is a known condition, have it use the static ID.
    if (Object.keys(TERIOCK.content.conditions).includes(data?.system?.identifier)) { options.keepId = true; }
    if (data.disabled === true) { return false; }
  }

  /** @inheritDoc */
  async _preUpdate(changes, options, user) {
    const yes = await super._preUpdate(changes, options, user);
    if (yes === false) { return false; }

    if (changes.disabled === true) { return false; }
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
