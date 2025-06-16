const { fields } = foundry.data;
import { _messageParts } from "./_message-parts.mjs";
import { MixinWikiData } from "../../mixins/wiki.mjs";
import { TeriockEffectData } from "../base/base.mjs";

export class TeriockPropertyData extends MixinWikiData(TeriockEffectData) {
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