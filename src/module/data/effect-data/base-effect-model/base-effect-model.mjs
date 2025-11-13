import { mergeMetadata } from "../../../helpers/utils.mjs";
import { ChildTypeModel } from "../../models/_module.mjs";

const { fields } = foundry.data;

/**
 * Base effect data model.
 */
export default class TeriockBaseEffectModel extends ChildTypeModel {
  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, {
    modifies: "Actor",
  });

  /** @inheritDoc */
  static defineSchema() {
    return foundry.utils.mergeObject(super.defineSchema(), {
      deleteOnExpire: new fields.BooleanField({
        initial: false,
        label: "Delete On Expire",
      }),
      suppression: new fields.SchemaField({
        statuses: new fields.SchemaField({
          active: new fields.SetField(
            new fields.StringField({
              choices: TERIOCK.index.conditions,
            }),
          ),
          inactive: new fields.SetField(
            new fields.StringField({
              choices: TERIOCK.index.conditions,
            }),
          ),
        }),
      }),
      updateCounter: new fields.BooleanField({
        initial: false,
        label: "Update Counter",
      }),
    });
  }

  /**
   * What this modifies.
   * @returns {TeriockParentName}
   */
  get modifies() {
    return this.metadata.modifies;
  }

  /** @inheritDoc */
  async _preDelete(options, user) {
    const data = { doc: this.parent };
    await this.parent.hookCall("effectExpiration", data, this.parent);
    if (data.cancel) {
      return false;
    }
    await super._preDelete(options, user);
  }

  /**
   * Checks if the effect should expire and expires it if necessary.
   * @returns {Promise<void>} Promise that resolves when the expiration check is complete.
   */
  async checkExpiration() {
    if (await this.shouldExpire()) {
      await this.expire();
    }
  }

  /**
   * Expires the effect, removing it from the parent document.
   * @returns {Promise<void>} Promise that resolves when the effect is expired.
   */
  async expire() {
    if (!this.deleteOnExpire) {
      const data = { doc: this.parent };
      await this.parent.hookCall("effectExpiration", data, this.parent);
      if (data.cancel) {
        return;
      }
    }
    if (this.deleteOnExpire) {
      await this.parent.delete();
    } else {
      await this.parent.update({ disabled: true });
    }
  }

  /**
   * Checks if the effect should expire based on its current state.
   * @returns {Promise<boolean>} True if the effect should expire, false otherwise.
   */
  async shouldExpire() {
    if (!this.parent.isTemporary) {
      return false;
    }
    return this.parent.duration.remaining < 0;
  }
}
