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
    };
  }
}
