import TeriockDetectionMode from "./teriock-detection-mode.mjs";
const { Token } = foundry.canvas.placeables;

export default class DetectionModeEtherealEthereal extends TeriockDetectionMode {

  /** @override */
  _canDetect(visionSource, target) {
    if (!super._canDetect(visionSource, target)) {
      return false;
    }
    const src = visionSource.object.document;
    if (target instanceof Token) {
      const tgt = target.document;
      if (!(src.hasStatusEffect('ethereal') && tgt.hasStatusEffect('ethereal'))) {
        return false;
      }
    }
    return true;
  }
}