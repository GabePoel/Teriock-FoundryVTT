const { Token } = foundry.canvas.placeables;
import EtherealFilter from "../../rendering/ethereal-filter.mjs";
import BaseDetectionMode from "./base-detection-mode.mjs";

/**
 * Ethereal creatures seeing Material creatures.
 */
export default class DetectionModeEtherealMaterial extends BaseDetectionMode {
  /** @inheritDoc */
  static getDetectionFilter() {
    return (this._detectionFilter ??= EtherealFilter.create({
      blur: 10,
    }));
  }

  /** @inheritDoc */
  _canDetect(visionSource, target) {
    if (!super._canDetect(visionSource, target)) {
      return false;
    }
    const src = visionSource.object.document;
    if (target instanceof Token) {
      const tgt = target.document;
      if (
        !(src.hasStatusEffect("ethereal") && !tgt.hasStatusEffect("ethereal"))
      ) {
        return false;
      }
    }
    return true;
  }

  /** @inheritDoc */
  _testPoint(visionSource, mode, target, test) {
    if (!super._testPoint(visionSource, mode, target, test)) return false;
    return canvas.effects.testInsideLight(test.point);
  }
}
