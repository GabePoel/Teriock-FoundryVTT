import PseudoDocument from "./pseudo-document.mjs";

const { fields } = foundry.data;

export default class TypedPseudoDocument extends PseudoDocument {
  /**
   * The key for this pseudo-document's type.
   * @returns {string}
   */
  static get TYPE() {
    return "";
  }

  /**
   * Subtypes of this pseudo-document.
   * @returns {Record<string, TypedPseudoDocument>}
   */
  static get TYPES() {
    return {};
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      type: new fields.StringField({
        required: true,
        nullable: false,
        initial: this.TYPE,
        blank: false,
      }),
    });
  }
}
