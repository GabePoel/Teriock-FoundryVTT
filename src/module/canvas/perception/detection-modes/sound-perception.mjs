const { OutlineOverlayFilter } = foundry.canvas.rendering.filters;
const { Token } = foundry.canvas.placeables;
import TeriockDetectionMode from "./teriock-detection-mode.mjs";

/**
 * Relevant wiki pages:
 * - [Advanced Hearing](https://wiki.teriock.com/index.php/Ability:Advanced_Hearing)
 */
export default class DetectionModeSoundPerception extends TeriockDetectionMode {
  static BLOCKING_SRC_STATUS_EFFECTS = [
    "down",
    "frozen",
    "asleep",
    "unconscious",
    "dead",
    "deaf",
    "ethereal",
  ];
  static BLOCKING_TGT_STATUS_EFFECTS = ["silent", "ethereal"];

  /** @override */
  static getDetectionFilter() {
    return (this._detectionFilter ??= OutlineOverlayFilter.create({
      outlineColor: [0.5, 0.5, 0, 1],
      knockout: true,
      wave: true,
    }));
  }

  /** @override */
  _canDetect(visionSource, target) {
    if (!super._canDetect(visionSource, target)) {
      return false;
    }
    const src = visionSource.object.document;
    if (target instanceof Token) {
      if (src.hasStatusEffect("deaf")) {
        return false;
      }
    }
    return true;
  }
}
