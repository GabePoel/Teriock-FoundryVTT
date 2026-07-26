import EtherealLightPlaceableMixin from "./ethereal-light-placeable-mixin.mjs";

const { Note } = foundry.canvas.placeables;

/**
 * @extends {Note}
 * @mixes EtherealLightPlaceable
 * @inheritDoc
 */
export default class TeriockNote extends EtherealLightPlaceableMixin(Note) {
  /** @inheritDoc */
  get isEthereal() {
    return this.document?.isEthereal;
  }

  /** @inheritDoc */
  get isVisible() {
    if (this.isEthereal && !game.canvas.lighting.isEtherealVisible) { return false; }
    return super.isVisible;
  }
}
