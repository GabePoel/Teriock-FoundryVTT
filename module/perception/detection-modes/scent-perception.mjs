const { OutlineOverlayFilter } = foundry.canvas.rendering.filters;
import TeriockDetectionMode from "./teriock-detection-mode.mjs";

export default class DetectionModeScentPerception extends TeriockDetectionMode {
    static BLOCKING_SRC_STATUS_EFFECTS = [
    "down",
    "frozen",
    "asleep",
    "unconscious",
    "dead",
    "anosmatic",
    "ethereal",
  ];
  static BLOCKING_TGT_STATUS_EFFECTS = [
    "odorless",
    "ethereal",
  ];

  /** @override */
  static getDetectionFilter() {
    return this._detectionFilter ??= OutlineOverlayFilter.create({
      outlineColor: [0.5, 0.5, 0, 1],
      knockout: true,
      wave: true
    });
  }

  /** @override */
  _canDetect(visionSource, target) {
    if (!super._canDetect(visionSource, target)) {
      return false;
    }
    const src = visionSource.object.document;
    if (target instanceof Token) {
      if (src.hasStatusEffect('anosmatic')) {
        return false;
      }
    }
    return true;
  }
}