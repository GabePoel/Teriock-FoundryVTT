import BaseDetectionMode from "./base-detection-mode.mjs";

const { Token } = foundry.canvas.placeables;

export default class DetectionModeEthereal extends BaseDetectionMode {
  _canDetect(visionSource, target) {
    if (!super._canDetect(visionSource, target)) {
      return false;
    }
    if (target instanceof Token) {
      if (!target.document.hasStatusEffect("ethereal")) {
        return false;
      }
    }
    return true;
  }
}
