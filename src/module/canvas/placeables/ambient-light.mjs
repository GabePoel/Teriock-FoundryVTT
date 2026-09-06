import { mixClasses } from "../../helpers/construction.mjs";
import EtherealLightPlaceableMixin from "./ethereal-light-placeable-mixin.mjs";

const { AmbientLight } = foundry.canvas.placeables;

/**
 * @mixes EtherealLightPlaceable
 * @inheritDoc
 */
export default class TeriockAmbientLight extends mixClasses(AmbientLight, EtherealLightPlaceableMixin) {
  /** @inheritDoc */
  get isEthereal() {
    return this.document?.getFlag("teriock", "isEthereal");
  }
}
