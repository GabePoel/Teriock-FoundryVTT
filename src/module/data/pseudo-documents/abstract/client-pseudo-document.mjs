import TypedPseudoDocument from "./typed-pseudo-document.mjs";

const { fields } = foundry.data;

export default class ClientPseudoDocument extends TypedPseudoDocument {
  static get TYPES() {
    return Object.keys(game.model[this.metadata.name]);
  }

  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      _stats: new fields.DocumentStatsField(),
      flags: new fields.DocumentFlagsField(),
      name: new fields.StringField({
        required: true,
        blank: false,
        textSearch: true,
      }),
      system: new fields.TypeDataField(this),
      type: new fields.DocumentTypeField(this),
    });
  }

  _onUpdate(changed, options, userId) {
    if (this.system instanceof foundry.abstract.TypeDataModel) {
      this.system._onUpdate(changed, options, userId);
    }
  }
}
