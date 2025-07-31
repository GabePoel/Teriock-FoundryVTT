const { Token } = foundry.canvas.placeables;
import BaseDetectionMode from "./base-detection-mode.mjs";

/**
 * Material creatures seeing Material creatures in the dark.
 */
export default class DetectionModeDarkVision extends BaseDetectionMode {
  static BLOCKING_SRC_STATUS_EFFECTS = ["blind"];

  /** @inheritDoc */
  _canDetect(visionSource, target) {
    if (!super._canDetect(visionSource, target)) {
      return false;
    }
    const src = visionSource.object.document;
    if (target instanceof Token) {
      const tgt = target.document;
      if (
        !(!src.hasStatusEffect("ethereal") && !tgt.hasStatusEffect("ethereal"))
      ) {
        return false;
      }
    }
    return true;
  }
}
