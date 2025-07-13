const { OutlineOverlayFilter } = foundry.canvas.rendering.filters;
import TeriockDetectionMode from "./teriock-detection-mode.mjs";

/**
 * Relevant wiki pages:
 * - [True Sight](https://wiki.teriock.com/index.php/Ability:True_Sight)
 */
export default class DetectionModeTrueSightPerception extends TeriockDetectionMode {
  static BLOCKING_TGT_STATUS_EFFECTS = [];

  /** @override */
  static getDetectionFilter() {
    return (this._detectionFilter ??= OutlineOverlayFilter.create({
      outlineColor: [1, 1, 1, 1],
      knockout: true,
    }));
  }

  /** @override */
  _canDetect(visionSource, target) {
    return super._canDetect(visionSource, target);
  }
}
