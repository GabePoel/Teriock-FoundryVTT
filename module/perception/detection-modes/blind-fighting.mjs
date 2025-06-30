const { OutlineOverlayFilter } = foundry.canvas.rendering.filters;
import TeriockDetectionMode from "./teriock-detection-mode.mjs";

export default class DetectionModeBlindFighting extends TeriockDetectionMode {
  static BLOCKING_SRC_STATUS_EFFECTS = ["down", "frozen", "asleep", "unconscious", "dead", "ethereal"];
  static BLOCKING_TGT_STATUS_EFFECTS = ["ethereal", "hidden"];

  /** @override */
  static getDetectionFilter() {
    return (this._detectionFilter ??= OutlineOverlayFilter.create({
      outlineColor: [1, 0, 1, 1],
      knockout: true,
      wave: true
    }));
  }

  /** @override */
  _canDetect(visionSource, target) {
    return true;
  }
}
