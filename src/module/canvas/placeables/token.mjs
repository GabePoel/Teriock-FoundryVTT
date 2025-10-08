import { getIcon } from "../../helpers/path.mjs";

const { Token } = foundry.canvas.placeables;

/**
 * @property {TeriockTokenDocument} document
 * @property {Scene} scene
 */
export default class TeriockToken extends Token {
  /** @inheritDoc */
  async _draw(options) {
    if (
      (this.document.hasStatusEffect(CONFIG.specialStatusEffects.TRANSFORMED) ||
        this.document.hasStatusEffect(
          CONFIG.specialStatusEffects.ILLUSION_TRANSFORMED,
        )) &&
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
  async _drawEffects() {
    await super._drawEffects();
    if (
      this.document.hasStatusEffect("encumbered") &&
      this.document?.actor.system.encumbranceLevel > 0
    ) {
      await this._drawEffect(getIcon("conditions", "Encumbered"));
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
      await this._drawOverlay(overlayImg);
    }
  }

  /** @inheritDoc */
  _onApplyStatusEffect(statusId, active) {
    if (
      [
        CONFIG.specialStatusEffects.TRANSFORMED,
        CONFIG.specialStatusEffects.ILLUSION_TRANSFORMED,
        CONFIG.specialStatusEffects.DEFEATED,
      ].includes(statusId)
    ) {
      this.renderFlags.set({ redraw: true });
    }
    super._onApplyStatusEffect(statusId, active);
  }
}
