import TeriockDetectionMode from "./teriock-detection-mode.mjs";
const { OutlineOverlayFilter } = foundry.canvas.rendering.filters;

export default class DetectionModeTrueSightPerception extends TeriockDetectionMode {
  static BLOCKING_TGT_STATUS_EFFECTS = [];

  /** @override */
  static getDetectionFilter() {
    return this._detectionFilter ??= OutlineOverlayFilter.create({
      outlineColor: [1, 1, 1, 1],
      knockout: true,
    });
  }

  /** @override */
  _canDetect(visionSource, target) {
    if (!super._canDetect(visionSource, target)) {
      return false;
    }
    return true;
  }
}