import BaseDetectionMode from "./base-detection-mode.mjs";

const { Token } = foundry.canvas.placeables;

/**
 * Relevant wiki pages:
 * - [See Invisible](https://wiki.teriock.com/index.php/Ability:See_Invisible)
 */
export default class DetectionModeInvisiblePerception extends BaseDetectionMode {
  static BLOCKING_TGT_STATUS_EFFECTS = [ "hidden" ];

  /** @inheritDoc */
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
