import { getIcon } from "../../helpers/path.mjs";

const { Token } = foundry.canvas.placeables;

/**
 * @property {TeriockTokenDocument} document
 * @property {Scene} scene
 */
export default class TeriockToken extends Token {
  /** @inheritDoc */
  async _draw(options) {
    this.document.deriveTexture();
    await super._draw(options);
  }

  /** @inheritDoc */
  async _drawEffects() {
    await super._drawEffects();
    const promises = [];
    if (
      this.document.hasStatusEffect("encumbered") &&
      this.document?.actor.system.encumbranceLevel > 0
    ) {
      promises.push(this._drawEffect(getIcon("conditions", "Encumbered")));
    }
    let overlayImg;
    if (
      this.document.hasStatusEffect("down") ||
      this.document.hasStatusEffect("unconscious")
    ) {
      overlayImg = "icons/svg/unconscious.svg";
    }
    if (this.document.hasStatusEffect("criticallyWounded")) {
      overlayImg = "icons/svg/blood.svg";
    }
    if (this.document.hasStatusEffect("dead")) {
      overlayImg = "icons/svg/skull.svg";
    }
    if (overlayImg) {
      promises.push(this._drawOverlay(overlayImg));
    }
    await Promise.allSettled(promises);
    this.effects.sortChildren();
    this.effects.renderable = true;
    this.renderFlags.set({ refreshEffects: true });
  }

  /** @inheritDoc */
  _onApplyStatusEffect(statusId, active) {
    if (
      [
        CONFIG.specialStatusEffects.TRANSFORMED,
        CONFIG.specialStatusEffects.ILLUSION_TRANSFORMED,
      ].includes(statusId)
    ) {
      this.renderFlags.set({ redraw: true });
    }
    super._onApplyStatusEffect(statusId, active);
  }
}
