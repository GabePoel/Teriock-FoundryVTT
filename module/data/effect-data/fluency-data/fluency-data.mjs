const { fields } = foundry.data;
import { _messageParts } from "./methods/_messages.mjs";
import { _roll } from "./methods/_rolling.mjs";
import { WikiDataMixin } from "../../mixins/wiki-mixin.mjs";
import TeriockBaseEffectData from "../base-data/base-data.mjs";

/**
 * @extends {TeriockBaseEffectData}
 */
export default class TeriockFluencyData extends WikiDataMixin(TeriockBaseEffectData) {
  /** @inheritdoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      type: "fluency",
    });
  }

  /** @override */
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

  /** @override */
  get suppressed() {
    let suppressed = super.suppressed;
    if (!suppressed && this.parent?.parent?.type === "equipment") {
      suppressed = !this.parent.parent.system.attuned;
    }
    return suppressed;
  }

  /** @override */
  async roll(options) {
    await _roll(this, options);
  }

  /** @override */
  get messageParts() {
    return { ...super.messageParts, ..._messageParts(this) };
  }

  /** @override */
  get wikiPage() {
    return `Tradecraft:${CONFIG.TERIOCK.tradecraftOptions[this.field].tradecrafts[this.tradecraft].name}`;
  }
}
