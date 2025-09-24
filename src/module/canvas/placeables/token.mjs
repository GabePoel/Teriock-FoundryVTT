const { Token } = foundry.canvas.placeables;

export default class TeriockToken extends Token {
  /** @inheritDoc */
  async _draw(options) {
    if (
      this.document.hasStatusEffect(CONFIG.specialStatusEffects.TRANSFORMED) &&
      this.document?.actor.system.transformation.img
    ) {
      this.document.texture.raw = this.document.texture.src;
      this.document.texture.src = this.document.actor.system.transformation.img;
    } else {
      if (this.document.texture?.raw) {
        this.document.texture.src = this.document.texture.raw;
      }
    }
    await super._draw(options);
  }

  /** @inheritDoc */
  _onApplyStatusEffect(statusId, active) {
    if (
      [
        CONFIG.specialStatusEffects.TRANSFORMED,
        CONFIG.specialStatusEffects.DEFEATED,
      ].includes(statusId)
    ) {
      this.renderFlags.set({ redraw: true });
    }
    super._onApplyStatusEffect(statusId, active);
  }
}
