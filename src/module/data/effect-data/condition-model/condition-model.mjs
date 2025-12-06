import { inCombatExpirationDialog } from "../../../applications/dialogs/_module.mjs";
import { toCamelCase } from "../../../helpers/string.mjs";
import { makeIcon } from "../../../helpers/utils.mjs";
import {
  TransformationDataMixin,
  WikiDataMixin,
} from "../../mixins/_module.mjs";
import { combatExpirationMethodField } from "../../fields/helpers/builders.mjs";
import TeriockBaseEffectModel from "../base-effect-model/base-effect-model.mjs";

const { fields } = foundry.data;

/**
 * Condition-specific effect data model.
 *
 * Relevant wiki pages:
 * - [Conditions](https://wiki.teriock.com/index.php/Category:Conditions)
 *
 * @extends {TeriockBaseEffectModel}
 * @mixes TransformationData
 * @mixes WikiData
 */
export default class TeriockConditionModel extends TransformationDataMixin(
  WikiDataMixin(TeriockBaseEffectModel),
) {
  /** @inheritDoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      namespace: "Condition",
      type: "condition",
    });
  }

  /** @inheritDoc */
  static defineSchema() {
    return foundry.utils.mergeObject(super.defineSchema(), {
      expirations: new fields.SchemaField({
        combat: new fields.SchemaField({
          what: combatExpirationMethodField(),
        }),
      }),
    });
  }

  /**
   * @inheritDoc
   */
  getCardContextMenuEntries(_doc) {
    return [
      {
        name: this.useText,
        icon: makeIcon(this.useIcon, "contextMenu"),
        callback: this.use.bind(this),
        condition: this.parent.isOwner,
        group: "usage",
      },
    ];
  }

  /**
   * A key corresponding to this condition.
   * @returns {string}
   */
  get conditionKey() {
    if (
      Object.values(TERIOCK.data.conditions)
        .map((c) => c._id)
        .includes(this.parent.id)
    ) {
      return Object.values(TERIOCK.data.conditions).find(
        (c) => c._id === this.parent.id,
      ).id;
    } else {
      return toCamelCase(this.parent.name);
    }
  }

  /** @inheritDoc */
  get displayFields() {
    return ["description"];
  }

  get embedIcons() {
    return [
      {
        icon: "dice-d4",
        tooltip: "Roll to Remove",
        condition: true,
        callback: async () => this.parent.use(),
        action: "removeConditionDoc",
      },
    ];
  }

  /** @inheritDoc */
  get useIcon() {
    return "dice-d4";
  }

  /** @inheritDoc */
  get useText() {
    return `Roll to Remove ${this.parent.name}`;
  }

  /** @inheritDoc */
  async expire() {
    if (
      Object.values(TERIOCK.index.conditions).includes(this.conditionKey) &&
      this.actor
    ) {
      await this.actor.system.removeCondition(this.conditionKey);
    } else {
      await super.expire();
    }
  }

  /**
   * Trigger in-combat expiration.
   * @param {boolean} [forceDialog] - Force a dialog to show up.
   * @returns {Promise<void>}
   */
  async inCombatExpiration(forceDialog = false) {
    await inCombatExpirationDialog(this.parent, forceDialog);
  }

  /** @inheritDoc */
  async roll(_options = {}) {
    if (this.parent.id.includes("dead") && this.parent.actor) {
      await this.parent.actor.system.deathBagPull();
    } else {
      await this.inCombatExpiration(true);
    }
  }
}
