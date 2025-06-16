export const ChildDataMixin = (Base) => class ChildDataMixin extends Base {
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