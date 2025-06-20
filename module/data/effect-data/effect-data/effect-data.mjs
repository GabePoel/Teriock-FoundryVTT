const { fields } = foundry.data;
import TeriockBaseEffectData from "../base-data/base-data.mjs";

/**
 * @extends {TeriockBaseEffectData}
 */
export default class TeriockEffectData extends TeriockBaseEffectData {
  /** @inheritdoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      type: "effect",
    });
  }

  /** @override */
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
    };
  }

  /**
   * @returns {boolean}
   */
  get conditionExpiration() {
    return this.expirations.condition.value ? true : false;
  }

  /**
   * @returns {boolean}
   */
  get movementExpiration() {
    return this.expirations.movement;
  }

  /**
   * @returns {boolean}
   */
  get dawnExpiration() {
    return this.expirations.dawn;
  }

  /**
   * @returns {boolean}
   */
  get sustainedExpiration() {
    return this.expirations.sustained;
  }

  /** @override */
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
