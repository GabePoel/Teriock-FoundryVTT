const { fields } = foundry.data;
import { _messageParts } from "./methods/_messages.mjs";
import { WikiDataMixin } from "../../mixins/wiki-mixin.mjs";
import TeriockBaseEffectData from "../base-data/base-data.mjs";

/**
 * @extends {TeriockBaseEffectData}
 */
export default class TeriockPropertyData extends WikiDataMixin(TeriockBaseEffectData) {
  /** @inheritdoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      type: "property",
    });
  }

  static defineSchema() {
    const commonData = super.defineSchema();
    return {
      ...commonData,
      wikiNamespace: new fields.StringField({ initial: "Property", gmOnly: true }),
      propertyType: new fields.StringField({ initial: "normal" }),
      damageType: new fields.StringField({ initial: "" }),
    };
  }

  /** @override */
  get messageParts() {
    return { ...super.messageParts, ..._messageParts(this) };
  }
}
