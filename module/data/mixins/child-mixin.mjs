const { fields } = foundry.data;

export const ChildDataMixin = (Base) => class ChildDataMixin extends Base {

  /** @override */
  static defineSchema() {
    return {
      proficient: new fields.BooleanField({
        initial: false,
        label: "Proficient",
      }),
      fluent: new fields.BooleanField({
        initial: false,
        label: "Fluent",
      }),
      font: new fields.StringField({
        initial: "",
        label: "Font",
        hint: "The font to be used for this document's name on its sheet and in chat messages.",
      }),
      description: new fields.HTMLField({ initial: "<p>None.</p>" }),
    }
  }

  async roll(options) {
    await this.parent.roll(options);
  }

  async use(options) {
    await this.roll(options);
  }

  get messageParts() {
    return {
      image: this.parent.img,
      name: this.parent.name,
      bars: [],
      blocks: [],
      font: this.font,
    }
  }

  get secretMessageParts() {
    return {
      image: "systems/teriock/assets/uncertainty.svg",
      name: this.parent.type.charAt(0).toUpperCase() + this.parent.type.slice(1),
      bars: [],
      blocks: [],
      font: null,
    }
  }
}