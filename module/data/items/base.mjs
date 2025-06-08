const { fields } = foundry.data;
const { TypeDataModel } = foundry.abstract;

export class TeriockItemData extends TypeDataModel {
  static defineSchema() {
    return {
      description: new fields.HTMLField(),
      disabled: new fields.BooleanField({ initial: false }),
      proficient: new fields.BooleanField({ initial: false }),
      font: new fields.StringField({ initial: "" }),
    }
  }
}