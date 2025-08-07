import { WikiDataMixin } from "../../mixins/_module.mjs";
import TeriockBaseEffectData from "../base-effect-data/base-effect-data.mjs";
import { _messageParts } from "./methods/_messages.mjs";
import { _roll } from "./methods/_rolling.mjs";

const { fields } = foundry.data;

/**
 * Fluency-specific effect data model.
 *
 * Relevant wiki pages:
 * - [Tradecraft Fluencies](https://wiki.teriock.com/index.php/Core:Tradecraft_Fluencies)
 *
 * @extends {TeriockBaseEffectData}
 */
export default class TeriockFluencyData extends WikiDataMixin(
  TeriockBaseEffectData,
) {
  /**
   * Metadata for this effect.
   *
   * @type {Readonly<Teriock.EffectDataModelMetadata>}
   */
  static metadata = Object.freeze({
    consumable: false,
    hierarchy: false,
    namespace: "Tradecraft",
    pageNameKey: "system.tradecraft",
    type: "fluency",
    usable: true,
    wiki: true,
  });

  /**
   * Checks if the fluency effect is suppressed.
   * Combines base suppression with attunement-based suppression for equipment.
   *
   * @returns {boolean} True if the fluency effect is suppressed, false otherwise.
   * @override
   */
  get suppressed() {
    let suppressed = super.suppressed;
    if (!suppressed && this.parent?.parent?.type === "equipment") {
      suppressed = !this.parent.parent.system.isAttuned;
    }
    return suppressed;
  }

  /**
   * Gets the message parts for the fluency effect.
   * Combines base message parts with fluency-specific message parts.
   *
   * @returns {object} Object containing message parts for the fluency effect.
   * @override
   */
  get messageParts() {
    return { ...super.messageParts, ..._messageParts(this) };
  }

  /**
   * Gets the wiki page URL for the fluency effect.
   *
   * @returns {string} The wiki page URL for the tradecraft.
   * @override
   */
  get wikiPage() {
    return `${this.constructor.metadata.namespace}:${CONFIG.TERIOCK.tradecraftOptions[this.field].tradecrafts[this.tradecraft].name}`;
  }

  /**
   * Defines the schema for the fluency data model.
   *
   * @returns {object} The schema definition for the fluency data.
   * @override
   */
  static defineSchema() {
    return foundry.utils.mergeObject(super.defineSchema(), {
      wikiNamespace: new fields.StringField({
        initial: "Tradecraft",
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
    });
  }

  /**
   * Rolls the fluency effect with the specified options.
   *
   * @param {object} options - Options for the fluency roll.
   * @returns {Promise<void>} Promise that resolves when the roll is complete.
   * @override
   */
  async roll(options) {
    await _roll(this, options);
  }
}
