import { mixClasses } from "../../../../helpers/construction.mjs";
import * as systemMixins from "../../mixins/_module.mjs";

const { TypeDataModel } = foundry.abstract;

/**
 * @extends {TypeDataModel}
 * @mixes CommonSystem
 */
export default class AbstractActorSystem extends mixClasses(TypeDataModel, systemMixins.CommonSystemMixin) {
  /**
   * Helper method to add a virtual status.
   * @param {Teriock.Keys.Condition} condition
   * @param {string} reason
   * @param {object} [options]
   * @param {boolean} [options.localize]
   */
  _addVirtualStatus(condition, reason, options = {}) {
    const { localize = true } = options;
    if (!reason) { reason = TERIOCK.reference.conditions[condition]; }
    this.conditionInformation[condition]?.reasons?.add(localize ? _loc(reason) : reason);
    this.parent.statuses.add(condition);
  }

  /**
   * Helper method to add multiple virtual statuses with the same reason.
   * @param {Teriock.Keys.Condition[]} conditions
   * @param {string} reason
   * @param {object} [options]
   * @param {boolean} [options.localize]
   */
  _addVirtualStatuses(conditions, reason, options = {}) {
    for (const condition of conditions) { this._addVirtualStatus(condition, reason, options); }
  }

  /** @inheritDoc */
  prepareCleanupData() {
    this.prepareVirtualEffects();
    super.prepareCleanupData();
  }

  /**
   * Add statuses and explanations for "virtual effects". These are things that would otherwise be represented with
   * {@link TeriockActiveEffect}s, but that we want to be able to add synchronously during the update cycle. Any of
   * these effects that should be shown on the token need to be manually added to {@link TeriockToken._drawEffects}.
   */
  prepareVirtualEffects() {}
}
