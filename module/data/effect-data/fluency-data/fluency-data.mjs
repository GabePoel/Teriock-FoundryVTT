/** @import { CommonRollOptions } from "../../../../types/rolls"; */
const { fields } = foundry.data;
import { _messageParts } from "./methods/_messages.mjs";
import { _roll } from "./methods/_rolling.mjs";
import { WikiDataMixin } from "../../mixins/wiki-mixin.mjs";
import TeriockBaseEffectData from "../base-data/base-data.mjs";

/**
 * Fluency-specific effect data model.
 * Handles fluency functionality including tradecraft proficiency and wiki integration.
 * @extends {TeriockBaseEffectData}
 */
export default class TeriockFluencyData extends WikiDataMixin(TeriockBaseEffectData) {
  /**
   * Gets the metadata for the fluency data model.
   * @inheritdoc
   * @returns {object} The metadata object with fluency type information.
   */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      type: "fluency",
    });
  }

  /**
   * Defines the schema for the fluency data model.
   * @override
   * @returns {object} The schema definition for the fluency data.
   */
  static defineSchema() {
    const commonData = super.defineSchema();
    return {
      ...commonData,
      wikiNamespace: new fields.StringField({
        initial: "Tradecraft",
        gmOnly: true,
      }),
      field: new fields.StringField({
        initial: "artisan",
        label: "Field",
      }),
      tradecraft: new fields.StringField({
        initial: "artist",
        label: "Tradecraft",
      }),
      proficient: new fields.BooleanField({
        initial: true,
        label: "Proficient",
      }),
      fluent: new fields.BooleanField({
        initial: true,
        label: "Fluent",
      }),
    };
  }

  /**
   * Checks if the fluency effect is suppressed.
   * Combines base suppression with attunement-based suppression for equipment.
   * @override
   * @returns {boolean} True if the fluency effect is suppressed, false otherwise.
   */
  get suppressed() {
    let suppressed = super.suppressed;
    if (!suppressed && this.parent?.parent?.type === "equipment") {
      suppressed = !this.parent.parent.system.attuned;
    }
    return suppressed;
  }

  /**
   * Rolls the fluency effect with the specified options.
   * @override
   * @param {CommonRollOptions} options - Options for the fluency roll.
   * @returns {Promise<void>} Promise that resolves when the roll is complete.
   */
  async roll(options) {
    await _roll(this, options);
  }

  /**
   * Gets the message parts for the fluency effect.
   * Combines base message parts with fluency-specific message parts.
   * @override
   * @returns {object} Object containing message parts for the fluency effect.
   */
  get messageParts() {
    return { ...super.messageParts, ..._messageParts(this) };
  }

  /**
   * Gets the wiki page URL for the fluency effect.
   * @override
   * @returns {string} The wiki page URL for the tradecraft.
   */
  get wikiPage() {
    return `Tradecraft:${CONFIG.TERIOCK.tradecraftOptions[this.field].tradecrafts[this.tradecraft].name}`;
  }
}
