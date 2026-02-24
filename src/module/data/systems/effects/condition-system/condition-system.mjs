import { inCombatExpirationDialog } from "../../../../applications/dialogs/_module.mjs";
import { makeIcon, mix } from "../../../../helpers/utils.mjs";
import { combatExpirationMethodField } from "../../../fields/helpers/builders.mjs";
import { ThresholdDataMixin } from "../../../shared/mixins/_module.mjs";
import * as mixins from "../../mixins/_module.mjs";
import BaseEffectSystem from "../base-effect-system/base-effect-system.mjs";

const { fields } = foundry.data;

//noinspection JSClosureCompilerSyntax
/**
 * Condition-specific effect data model.
 *
 * Relevant wiki pages:
 * - [Conditions](https://wiki.teriock.com/index.php/Category:Conditions)
 *
 * @extends {BaseEffectSystem}
 * @implements {Teriock.Models.ConditionSystemInterface}
 * @mixes TransformationSystem
 * @mixes WikiSystem
 */
export default class ConditionSystem extends mix(
  BaseEffectSystem,
  mixins.WikiSystemMixin,
  mixins.TransformationSystemMixin,
  ThresholdDataMixin,
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
   * A key corresponding to this condition.
   * @returns {string}
   */
  get conditionKey() {
    const idMap = Object.fromEntries(
      Object.entries(TERIOCK.data.conditions).map(([id, data]) => [
        data._id,
        id,
      ]),
    );
    return idMap[this.parent.id];
  }

  /** @inheritDoc */
  get displayFields() {
    return ["description"];
  }

  /** @inheritDoc */
  get embedIcons() {
    return [
      {
        icon: "dice-d4",
        tooltip: game.i18n.localize(
          "TERIOCK.SYSTEMS.Condition.EMBED.rollToRemove",
        ),
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
    return game.i18n.format("TERIOCK.SYSTEMS.Condition.USAGE.use", {
      value: this.parent.name,
    });
  }

  /** @inheritDoc */
  async _use(_options = {}) {
    if (this.parent.id.includes("dead") && this.parent.actor) {
      await this.parent.actor.system.deathBagPull();
    } else {
      await this.inCombatExpiration(true);
    }
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
   * Trigger in-combat expiration.
   * @param {boolean} [forceDialog] - Force a dialog to show up.
   * @returns {Promise<void>}
   */
  async inCombatExpiration(forceDialog = false) {
    await inCombatExpirationDialog(this.parent, forceDialog);
  }
}
