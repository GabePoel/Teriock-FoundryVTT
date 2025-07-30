const { Token } = foundry.canvas.placeables;
import TeriockDetectionMode from "./teriock-detection-mode.mjs";

/**
 * Ethereal creatures seeing Ethereal creatures.
 *
 * Relevant wiki pages:
 * - [Ethereal](https://wiki.teriock.com/index.php/Condition:Ethereal)
 */
export default class DetectionModeEtherealEthereal extends TeriockDetectionMode {
  /** @inheritDoc */
  _canDetect(visionSource, target) {
    if (!super._canDetect(visionSource, target)) {
      return false;
    }
    const src = visionSource.object.document;
    if (target instanceof Token) {
      const tgt = target.document;
      if (
        !(src.hasStatusEffect("ethereal") && tgt.hasStatusEffect("ethereal"))
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
