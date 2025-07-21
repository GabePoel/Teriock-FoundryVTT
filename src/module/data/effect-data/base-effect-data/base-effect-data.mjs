const { fields } = foundry.data;
const { TypeDataModel } = foundry.abstract;
import ChildDataMixin from "../../mixins/child-mixin.mjs";
import { _expire, _shouldExpire } from "./methods/_expiration.mjs";

/**
 * Base effect data model.
 *
 * @extends {TypeDataModel}
 */
export default class TeriockBaseEffectData extends ChildDataMixin(TypeDataModel) {
  /**
   * Metadata for this effect.
   *
   * @returns {Teriock.EffectMetadata}
   */
  static get metadata() {
    return foundry.utils.mergeObject({}, {
      type: "base",
      canSub: false,
    });
  }

  /**
   * Checks if the effect is suppressed.
   * Effects are suppressed if their parent item is disabled.
   *
   * @returns {boolean} True if the effect is suppressed, false otherwise.
   */
  get suppressed() {
    if (this.parent.parent?.documentName === "Item") {
      return this.parent.parent?.system.disabled;
    }
    return false;
  }

  /**
   * Get the actor associated with this effect data.
   *
   * @returns {TeriockActor|null}
   */
  get actor() {
    return this.parent.actor;
  }

  /**
   * Defines this effect's schema.
   *
   * @returns {object} The schema definition for the effect data.
   * @override
   */
  static defineSchema() {
    return foundry.utils.mergeObject(super.defineSchema(), {
      deleteOnExpire: new fields.BooleanField({
        initial: false,
        label: "Delete On Expire",
      }),
      updateCounter: new fields.BooleanField({
        initial: false,
        label: "Update Counter",
      }),
    });
  }

  /**
   * Checks if the effect should expire based on its current state.
   *
   * @returns {boolean} True if the effect should expire, false otherwise.
   */
  shouldExpire() {
    return _shouldExpire(this);
  }

  /**
   * Expires the effect, removing it from the parent document.
   *
   * @returns {Promise<void>} Promise that resolves when the effect is expired.
   */
  async expire() {
    return await _expire(this);
  }

  /**
   * Checks if the effect should expire and expires it if necessary.
   *
   * @returns {Promise<void>} Promise that resolves when the expiration check is complete.
   */
  async checkExpiration() {
    if (this.shouldExpire()) {
      await this.expire();
    }
  }
}
