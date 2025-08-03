const { fields } = foundry.data;
import inCombatExpirationDialog from "../../../applications/dialogs/in-combat-expiration-dialog.mjs";
import { getRollIcon } from "../../../helpers/utils.mjs";
import { migrateHierarchy } from "../../shared/migrations.mjs";
import TeriockBaseEffectData from "../base-effect-data/base-effect-data.mjs";
import {
  combatExpirationMethodField,
  combatExpirationSourceTypeField,
  combatExpirationTimingField,
  hierarchyField
} from "../shared/shared-fields.mjs";
import { _messageParts } from "./methods/_messages.mjs";

/**
 * Effect-specific effect data model.
 */
export default class TeriockConsequenceData extends TeriockBaseEffectData {
  /**
   * Metadata for this effect.
   *
   * @returns {Teriock.EffectMetadata}
   */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      type: "consequence",
      canSub: true,
    });
  }

  /** @inheritDoc */
  get messageParts() {
    return {
      ...super.messageParts,
      ..._messageParts(this),
    };
  }

  /** @inheritDoc */
  get useIcon() {
    return getRollIcon(this.expirations.combat.what.roll);
  }

  /** @inheritDoc */
  get useText() {
    return `Roll to Remove ${this.parent.name}`
  }

  /**
   * Checks if the effect has condition-based expiration.
   *
   * @returns {boolean} True if the effect expires based on a condition, false otherwise.
   */
  get conditionExpiration() {
    return !!this.expirations.condition.value;
  }

  /**
   * Checks if the effect expires on movement.
   *
   * @returns {boolean} True if the effect expires on movement, false otherwise.
   */
  get movementExpiration() {
    return this.expirations.movement;
  }

  /**
   * Checks if the effect expires at dawn.
   *
   * @returns {boolean} True if the effect expires at dawn, false otherwise.
   */
  get dawnExpiration() {
    return this.expirations.dawn;
  }

  /**
   * Checks if the effect expires when its source is deleted or disabled.
   *
   * @returns {boolean} True if the effect expires when sustained, false otherwise.
   */
  get sustainedExpiration() {
    return this.expirations.sustained;
  }

  /**
   * Gets the maneuver type for this effect.
   * Effects are always passive maneuvers.
   *
   * @returns {string} The maneuver type ("passive").
   */
  get maneuver() {
    return "passive";
  }

  /**
   * Checks if the effect should expire based on various conditions.
   * Considers base expiration, condition-based expiration, and sustained expiration.
   *
   * @returns {boolean} True if the effect should expire, false otherwise.
   * @override
   */
  get shouldExpire() {
    let should = super.shouldExpire;
    if (this.conditionExpiration) {
      const condition = this.expirations.condition.value;
      const present = this.expirations.condition.present;
      const hasCondition = this.actor?.statuses.has(condition);
      should = should || (present ? hasCondition : !hasCondition);
    }
    if (this.sustainedExpiration) {
      const source = this.parent.source;
      should = should || !source || source.disabled;
    }
    return should;
  }

  /** @inheritDoc */
  static migrateData(data) {
    data = migrateHierarchy(data);
    return data;
  }

  /**
   * Defines the schema for the effect data model.
   *
   * @returns {object} The schema definition for the effect data.
   * @override
   */
  static defineSchema() {
    return foundry.utils.mergeObject(super.defineSchema(), {
      source: new fields.StringField({ initial: "", nullable: true }),
      expirations: new fields.SchemaField({
        condition: new fields.SchemaField({
          value: new fields.StringField({
            label: "Condition Expiration",
            nullable: true,
            initial: null,
            hint: "If specified, effect expires if condition is/isn't present.",
          }),
          present: new fields.BooleanField({
            initial: false,
            label: "Condition Present",
            hint: "If true, effect expires if condition is present. If false, effect expires if condition is not present.",
          }),
        }),
        movement: new fields.BooleanField({
          initial: false,
          label: "Stationary Expiration",
          hint: "If true, effect expires on movement.",
        }),
        dawn: new fields.BooleanField({
          initial: false,
          label: "Dawn Expiration",
          hint: "If true, effect expires at dawn.",
        }),
        sustained: new fields.BooleanField({
          initial: false,
          label: "Sustained Expiration",
          hint: "If true, effect expires if its source is deleted or disabled.",
        }),
        description: new fields.StringField({
          label: "End Condition",
          hint: "Under what circumstances should this effect expire?",
        }),
        combat: new fields.SchemaField({
          who: new fields.SchemaField({
            type: combatExpirationSourceTypeField(),
            source: new fields.DocumentUUIDField({
              type: "Actor",
              nullable: true,
              label: "Actor",
              hint: "UUID of actor whose turn or other information is used to trigger an expiration?",
            }),
          }),
          what: combatExpirationMethodField(),
          when: combatExpirationTimingField(),
        }),
      }),
      sourceDescription: new fields.HTMLField(),
      hierarchy: hierarchyField(),
    });
  }

  /**
   * Trigger in-combat expiration.
   *
   * @param {boolean} [forceDialog] - Force a dialog to show up.
   * @returns {Promise<void>}
   */
  async inCombatExpiration(forceDialog = false) {
    await inCombatExpirationDialog(this.parent, forceDialog);
  }

  /**
   * Rolls the consequence. Forced alias for {@link inCombatExpiration}.
   *
   * @returns {Promise<void>} Promise that resolves when the roll is complete.
   * @override
   */
  async roll() {
    await this.inCombatExpiration(true);
  }
}
