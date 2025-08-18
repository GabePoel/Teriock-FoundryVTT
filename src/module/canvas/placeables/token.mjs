const { Token } = foundry.canvas.placeables;

export default class TeriockToken extends Token {
  /** @inheritDoc */
  async _draw(options) {
    if (
      this.document.hasStatusEffect(CONFIG.specialStatusEffects.TRANSFORMED)
    ) {
      this.document.texture.raw = this.document.texture.src;
      this.document.texture.src =
        this.document?.actor.system.transformation.img;
    } else {
      if (this.document.texture?.raw) {
        this.document.texture.src = this.document.texture.raw;
      }
    }
    await super._draw(options);
  }

  /** @inheritDoc */
  _onApplyStatusEffect(statusId, active) {
    switch (statusId) {
      case CONFIG.specialStatusEffects.TRANSFORMED:
        this.renderFlags.set({ redraw: true });
    }
    super._onApplyStatusEffect(statusId, active);
  }
}
