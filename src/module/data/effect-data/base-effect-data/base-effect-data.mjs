import { makeIcon, mergeFreeze } from "../../../helpers/utils.mjs";
import { ChildTypeModel } from "../../models/_module.mjs";
import { comparatorField } from "../shared/shared-fields.mjs";
import { _expire, _shouldExpire } from "./methods/_expiration.mjs";

const { fields } = foundry.data;

/**
 * Base effect data model.
 *
 * @extends {ChildTypeModel}
 * @extends {TypeDataModel}
 */
export default class TeriockBaseEffectData extends ChildTypeModel {
  /**
   * @inheritDoc
   * @type {Teriock.Documents.EffectModelMetadata}
   */
  static metadata = mergeFreeze(/** @type {Teriock.Documents.EffectModelMetadata} */
    (super.metadata), {
      hierarchy: false,
      modifies: "Actor",
    });

  /** @inheritDoc */
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
      suppression: new fields.SchemaField({
        statuses: new fields.SchemaField({
          active: new fields.SetField(new fields.StringField({
            choices: TERIOCK.index.conditions,
          })),
          inactive: new fields.SetField(new fields.StringField({
            choices: TERIOCK.index.conditions,
          })),
        }),
        comparisons: new fields.SchemaField({
          actor: new fields.ArrayField(comparatorField()),
          item: new fields.ArrayField(comparatorField()),
        }),
      }),
    });
  }

  /**
   * Get the actor associated with this effect data.
   * @returns {TeriockActor|null}
   */
  get actor() {
    return /** @type {TeriockActor} */ this.parent.actor;
  }

  /** @inheritDoc */
  get cardContextMenuEntries() {
    return [
      ...super.cardContextMenuEntries,
      {
        name: "Open Source",
        icon: makeIcon("arrow-up-right-from-square", "contextMenu"),
        callback: async () => await this.parent.source.sheet.render(true),
        condition: this.parent.source.documentName !== "Actor",
        group: "open",
      },
    ];
  }

  /**
   * What this modifies.
   * @returns {"Actor" | "Item"}
   */
  get modifies() {
    return this.constructor.metadata.modifies;
  }

  /**
   * Checks if the effect should expire based on its current state.
   * @returns {boolean} True if the effect should expire, false otherwise.
   */
  get shouldExpire() {
    return _shouldExpire(this);
  }

  /**
   * Checks if the effect is suppressed.
   * Effects are suppressed if their parent item is disabled.
   * @returns {boolean} True if the effect is suppressed, false otherwise.
   */
  get suppressed() {
    if (this.parent.parent?.documentName === "Item" && this.parent.parent.system.shouldSuppress(this.parent.id)) {
      return true;
    }
    return !!(this.parent.parent?.documentName === "Item" && this.parent.parent?.system.disabled);
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
    if (this.shouldExpire) {
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
    return await _expire(this);
  }
}
