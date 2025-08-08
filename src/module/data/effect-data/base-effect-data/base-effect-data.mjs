import { conditions } from "../../../helpers/constants/generated/conditions.mjs";
import { makeIcon } from "../../../helpers/utils.mjs";
import { ChildDataMixin } from "../../mixins/_module.mjs";
import { comparatorField } from "../shared/shared-fields.mjs";
import { _expire, _shouldExpire } from "./methods/_expiration.mjs";

const { fields } = foundry.data;
const { TypeDataModel } = foundry.abstract;

/**
 * Base effect data model.
 *
 * @extends {TypeDataModel}
 */
export default class TeriockBaseEffectData extends ChildDataMixin(
  TypeDataModel,
) {
  /**
   * Metadata for this effect.
   *
   * @type {Readonly<Teriock.EffectDataModelMetadata>}
   */
  static metadata = Object.freeze({
    consumable: false,
    hierarchy: false,
    namespace: "",
    pageNameKey: "name",
    type: "base",
    usable: false,
    wiki: false,
  });

  /**
   * Checks if the effect is suppressed.
   * Effects are suppressed if their parent item is disabled.
   *
   * @returns {boolean} True if the effect is suppressed, false otherwise.
   */
  get suppressed() {
    if (
      this.parent.parent?.documentName === "Item" &&
      this.parent.parent.system.shouldSuppress(this.parent.id)
    ) {
      return true;
    }
    return !!(
      this.parent.parent?.documentName === "Item" &&
      this.parent.parent?.system.disabled
    );
  }

  /**
   * Get the actor associated with this effect data.
   *
   * @returns {TeriockActor|null}
   */
  get actor() {
    return /** @type {TeriockActor} */ this.parent.actor;
  }

  /**
   * Checks if the effect should expire based on its current state.
   *
   * @returns {boolean} True if the effect should expire, false otherwise.
   */
  get shouldExpire() {
    return _shouldExpire(this);
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
          active: new fields.SetField(
            new fields.StringField({
              choices: conditions,
            }),
          ),
          inactive: new fields.SetField(
            new fields.StringField({
              choices: conditions,
            }),
          ),
        }),
        comparisons: new fields.SchemaField({
          actor: new fields.ArrayField(comparatorField()),
          item: new fields.ArrayField(comparatorField()),
        }),
      }),
    });
  }

  /**
   * Expires the effect, removing it from the parent document.
   *
   * @returns {Promise<void>} Promise that resolves when the effect is expired.
   */
  async expire() {
    await this.actor?.hookCall("effectExpiration");
    return await _expire(this);
  }

  /**
   * Checks if the effect should expire and expires it if necessary.
   *
   * @returns {Promise<void>} Promise that resolves when the expiration check is complete.
   */
  async checkExpiration() {
    if (this.shouldExpire) {
      await this.expire();
    }
  }
}
