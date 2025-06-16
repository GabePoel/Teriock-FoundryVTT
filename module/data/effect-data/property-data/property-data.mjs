const { fields } = foundry.data;
import { _messageParts } from "./_message-parts.mjs";
import { TeriockBaseEffectData } from "../base-data/base-data.mjs";
import { WikiDataMixin } from "../../mixins/wiki-mixin.mjs";

export class TeriockPropertyData extends WikiDataMixin(TeriockBaseEffectData) {
  static defineSchema() {
    const commonData = super.defineSchema();
    return {
      ...commonData,
      wikiNamespace: new fields.StringField({ initial: "Property", gmOnly: true }),
      propertyType: new fields.StringField({ initial: "normal" }),
      damageType: new fields.StringField({ initial: "" }),
    }
  }

  /** @override */
  get messageParts() {
    return { ...super.messageParts, ..._messageParts(this.parent) };
  }
}