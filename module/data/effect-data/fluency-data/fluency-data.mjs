const { fields } = foundry.data;
import { _messageParts } from "./methods/_message-parts.mjs";
import { _roll } from "./methods/_rolling.mjs";
import { WikiDataMixin } from "../../mixins/wiki-mixin.mjs";
import TeriockBaseEffectData from "../base-data/base-data.mjs";

export default class TeriockFluencyData extends WikiDataMixin(TeriockBaseEffectData) {
  static defineSchema() {
    const commonData = super.defineSchema();
    return {
      ...commonData,
      wikiNamespace: new fields.StringField({ initial: "Tradecraft", gmOnly: true }),
      field: new fields.StringField({ initial: "artisan" }),
      tradecraft: new fields.StringField({ initial: "artist" }),
      proficient: new fields.BooleanField({ initial: true }),
      fluent: new fields.BooleanField({ initial: true }),
    }
  }

  /** @override */
  async roll(options) {
    await _roll(this.parent, options);
  }

  /** @override */
  get messageParts() {
    return { ...super.messageParts, ..._messageParts(this.parent) };
  }

  /** @override */
  get wikiPage() {
    return `Tradecraft:${CONFIG.TERIOCK.tradecraftOptions[this.field].tradecrafts[this.tradecraft].name}`;
  }
}