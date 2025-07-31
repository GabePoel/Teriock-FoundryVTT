const { OutlineOverlayFilter } = foundry.canvas.rendering.filters;
import BaseDetectionMode from "./base-detection-mode.mjs";

/**
 * Relevant wiki pages:
 * - [True Sight](https://wiki.teriock.com/index.php/Ability:True_Sight)
 */
export default class DetectionModeTrueSightPerception extends BaseDetectionMode {
  static BLOCKING_TGT_STATUS_EFFECTS = [];

  /** @inheritDoc */
  static getDetectionFilter() {
    return (this._detectionFilter ??= OutlineOverlayFilter.create({
      outlineColor: [1, 1, 1, 1],
      knockout: true,
    }));
  }
}
