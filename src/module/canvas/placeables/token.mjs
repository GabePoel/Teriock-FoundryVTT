import { BlankMixin } from "../../documents/mixins/_module.mjs";
import { getImage } from "../../helpers/path.mjs";

const { Token } = foundry.canvas.placeables;

/**
 * @extends {Token}
 * @property {TeriockTokenDocument} document
 * @property {TeriockActor|null} actor
 * @property {Scene} scene
 */
export default class TeriockToken extends BlankMixin(Token) {
  /** @inheritDoc */
  async _drawEffects() {
    await super._drawEffects();
    const promises = [];
    if (
      this.document.hasStatusEffect("encumbered") &&
      this.document?.actor.system.encumbranceLevel > 0
    ) {
      promises.push(this._drawEffect(getImage("conditions", "Encumbered")));
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
    switch (statusId) {
      case CONFIG.specialStatusEffects.ETHEREAL:
        canvas.perception.update({ refreshVision: true });
        break;
      case CONFIG.specialStatusEffects.HIDDEN:
        canvas.perception.update({ refreshVision: true });
        break;
    }
    super._onApplyStatusEffect(statusId, active);
  }
}
