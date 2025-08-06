import { conditions } from "../../../helpers/constants/generated/conditions.mjs";
import { smartEvaluateSync } from "../../../helpers/utils.mjs";
import ChildDataMixin from "../../mixins/child-mixin.mjs";
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
    if (
      this.parent.parent?.documentName === "Item" &&
      this.parent.parent?.system.disabled
    ) {
      return true;
    }
    // if (this.actor) {
    //   if (
    //     this.suppression.statuses.active.some((status) =>
    //       this.actor.statuses.has(status),
    //     )
    //   ) {
    //     return true;
    //   }
    //   if (
    //     this.suppression.statuses.inactive.some(
    //       (status) => !this.actor.statuses.has(status),
    //     )
    //   ) {
    //     return true;
    //   }
    //   if (
    //     this.suppression.comparisons.actor.some((comp) =>
    //       this._checkComparison(this.actor, comp),
    //     )
    //   ) {
    //     return true;
    //   }
    // }
    // return (
    //   this.parent.parent?.documentName === "Item" &&
    //   this.suppression.comparisons.item.some((comp) =>
    //     this._checkComparison(this.parent.parent, comp),
    //   )
    // );
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
   * Checks if the effect should expire based on its current state.
   *
   * @returns {boolean} True if the effect should expire, false otherwise.
   */
  get shouldExpire() {
    return _shouldExpire(this);
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
   * Helper method to check a single comparison
   *
   * @private
   */
  _checkComparison(target, comparator) {
    const actualValue = foundry.utils.getProperty(target, comparator.key);
    let { comparison, value } = comparator;

    if (typeof value === "string" && this.actor) {
      try {
        const newValue = smartEvaluateSync(value, this, { fail: null });
        if (newValue !== null) value = newValue;
      } catch {}
    }

    switch (comparison) {
      case "=":
        return actualValue === value;
      case "!=":
        return actualValue !== value;
      case ">":
        return actualValue > value;
      case "<":
        return actualValue < value;
      case ">=":
        return actualValue >= value;
      case "<=":
        return actualValue <= value;
      default:
        return false;
    }
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
