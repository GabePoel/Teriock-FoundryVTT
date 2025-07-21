const { Token } = foundry.canvas.placeables;
import EtherealFilter from "../filters/ethereal-filter.mjs";
import TeriockDetectionMode from "./teriock-detection-mode.mjs";

/**
 * Ethereal creatures seeing Material creatures.
 */
export default class DetectionModeEtherealMaterial extends TeriockDetectionMode {
  /** @override */
  static getDetectionFilter() {
    return (this._detectionFilter ??= EtherealFilter.create({
      blur: 10,
    }));
  }

  /** @override */
  _canDetect(visionSource, target) {
    if (!super._canDetect(visionSource, target)) {
      return false;
    }
    const src = visionSource.object.document;
    if (target instanceof Token) {
      const tgt = target.document;
      if (!(src.hasStatusEffect("ethereal") && !tgt.hasStatusEffect("ethereal"))) {
        return false;
      }
    }
    return true;
  }
}
