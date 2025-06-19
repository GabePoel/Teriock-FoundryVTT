const { Token } = foundry.canvas.placeables;
import TeriockDetectionMode from "./teriock-detection-mode.mjs";

export default class DetectionModeInvisiblePerception extends TeriockDetectionMode {
  static BLOCKING_TGT_STATUS_EFFECTS = ["hidden"];

  /** @override */
  _canDetect(visionSource, target) {
    if (!super._canDetect(visionSource, target)) {
      return false;
    }
    const src = visionSource.object.document;
    if (target instanceof Token) {
      const tgt = target.document;
      if (!src.hasStatusEffect("ethereal") && tgt.hasStatusEffect("invisible")) {
        return true;
      }
    }
    return false;
  }
}
