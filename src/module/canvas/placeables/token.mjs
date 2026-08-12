import EtherealLightPlaceableMixin from "./ethereal-light-placeable-mixin.mjs";

const { Token } = foundry.canvas.placeables;

/*
 * @type {{global: Set<Teriock.Keys.Condition>, local: Set<Teriock.Keys.Condition>}}
 */
const DETECTION_STATUSES = { global: new Set(["ethereal", "hidden"]), local: new Set(["anosmatic", "deaf"]) };

/**
 * Statuses that cause detection changes. The local ones leave "blind" out since that's handled by Foundry already.
 * @mixes EtherealLightPlaceable
 * @inheritDoc
 * @property {Scene} scene
 * @property {TeriockActor|null} actor
 * @property {TeriockTokenDocument} document
 */
export default class TeriockToken extends EtherealLightPlaceableMixin(Token) {
  /** @inheritDoc */
  get isEthereal() {
    return this.document?.hasStatusEffect("ethereal");
  }

  /** @inheritDoc */
  async _drawEffects() {
    await super._drawEffects();
    const promises = [];
    if (this.document.hasStatusEffect("encumbered") && this.document?.actor?.system.encumbranceLevel > 0) {
      promises.push(this._drawEffect(TERIOCK.statuses.conditions.encumbered.img));
    }
    let overlayImg;
    if (this.document.hasStatusEffect("down") || this.document.hasStatusEffect("unconscious")) {
      overlayImg = "icons/svg/unconscious.svg";
    }
    if (this.document.hasStatusEffect("criticallyWounded")) { overlayImg = "icons/svg/blood.svg"; }
    if (this.document.hasStatusEffect("dead")) { overlayImg = "icons/svg/skull.svg"; }
    if (overlayImg) { promises.push(this._drawOverlay(overlayImg)); }
    if (promises.length > 0) {
      await Promise.allSettled(promises);
      this.effects.sortChildren();
      this.effects.renderable = true;
      this.renderFlags.set({ refreshEffects: true });
    }
  }

  /** @inheritDoc */
  _getBarColors(index, data) {
    const colors = TERIOCK.display.colors[data.attribute];
    if (colors?.base && colors?.darkest) {
      return { empty: Color.fromString(colors.darkest), full: Color.fromString(colors.base) };
    }
    return super._getBarColors(index, data);
  }

  /** @inheritDoc */
  _onApplyStatusEffect(statusId, active) {
    if (DETECTION_STATUSES.local.has(statusId)) { this.initializeVisionSource(); }
    if (DETECTION_STATUSES.global.has(statusId)) { canvas.perception.update({ refreshVision: true }); }
    super._onApplyStatusEffect(statusId, active);
  }

  /**
   * Handle changes to hiding score.
   */
  _onChangeHidingScore() {
    canvas.perception.update({ refreshVision: true });
  }

  /**
   * Handle changes to perceiving score.
   */
  _onChangePerceivingScore() {
    this.initializeVisionSource();
  }
}
