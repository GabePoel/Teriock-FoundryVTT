import EtherealLightPlaceableMixin from "./ethereal-light-placeable-mixin.mjs";

const { AmbientLight } = foundry.canvas.placeables;

/**
 * @mixes EtherealLightPlaceable
 * @inheritDoc
 */
export default class TeriockAmbientLight extends EtherealLightPlaceableMixin(AmbientLight) {
  /** @inheritDoc */
  get isEthereal() {
    return this.document?.getFlag("teriock", "isEthereal");
  }
}
