const { fields } = foundry.data;
import TeriockBaseEffectData from "../base-data/base-data.mjs";

/**
 * Effect-specific effect data model.
 * Handles general effect functionality including various expiration types and child relationships.
 * @extends {TeriockBaseEffectData}
 */
export default class TeriockEffectData extends TeriockBaseEffectData {
  /**
   * Gets the metadata for the effect data model.
   * @inheritdoc
   * @returns {object} The metadata object with effect type information.
   */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      type: "effect",
    });
  }

  /**
   * Defines the schema for the effect data model.
   * @override
   * @returns {object} The schema definition for the effect data.
   */
  static defineSchema() {
    const commonData = super.defineSchema();
    return {
      ...commonData,
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
      }),
      childIds: new fields.ArrayField(new fields.DocumentIdField()),
      childUuids: new fields.ArrayField(new fields.DocumentUUIDField()),
    };
  }

  /**
   * Checks if the effect has condition-based expiration.
   * @returns {boolean} True if the effect expires based on a condition, false otherwise.
   */
  get conditionExpiration() {
    return this.expirations.condition.value ? true : false;
  }

  /**
   * Checks if the effect expires on movement.
   * @returns {boolean} True if the effect expires on movement, false otherwise.
   */
  get movementExpiration() {
    return this.expirations.movement;
  }

  /**
   * Checks if the effect expires at dawn.
   * @returns {boolean} True if the effect expires at dawn, false otherwise.
   */
  get dawnExpiration() {
    return this.expirations.dawn;
  }

  /**
   * Checks if the effect expires when its source is deleted or disabled.
   * @returns {boolean} True if the effect expires when sustained, false otherwise.
   */
  get sustainedExpiration() {
    return this.expirations.sustained;
  }

  /**
   * Gets the maneuver type for this effect.
   * Effects are always passive maneuvers.
   * @returns {string} The maneuver type ("passive").
   */
  get maneuver() {
    return "passive";
  }

  /**
   * Checks if the effect should expire based on various conditions.
   * Considers base expiration, condition-based expiration, and sustained expiration.
   * @override
   * @returns {boolean} True if the effect should expire, false otherwise.
   */
  shouldExpire() {
    let should = super.shouldExpire();
    if (this.conditionExpiration) {
      const condition = this.expirations.condition.value;
      const present = this.expirations.condition.present;
      const hasCondition = this.parent.getActor()?.statuses.has(condition);
      should = should || (present ? hasCondition : !hasCondition);
    }
    if (this.sustainedExpiration) {
      const source = this.parent.getSource();
      should = should || !source || source.disabled;
    }
    return should;
  }
}
