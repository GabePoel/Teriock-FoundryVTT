import { mixClasses } from "../../../../helpers/construction.mjs";
import { BaseSystemMixin, CommonSystemMixin } from "../../mixins/_module.mjs";

const { TypeDataModel } = foundry.abstract;

/**
 * @mixes BaseSystem
 * @mixes CommonSystem
 */
export default class AbstractActorSystem extends mixClasses(TypeDataModel, BaseSystemMixin, CommonSystemMixin) {
  /**
   * Performs post-update operations for the actor.
   * @returns {Promise<void>}
   */
  async postUpdate() {}

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
