const { fields } = foundry.data;
const { TypeDataModel } = foundry.abstract;

export class TeriockEffectData extends TypeDataModel {
  static defineSchema() {
    return {
      description: new fields.HTMLField({ initial: "<p>None.</p>" }),
      forceDisabled: new fields.BooleanField({ initial: false }),
    }
  }
}