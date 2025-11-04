import BaseDetectionMode from "./base-detection-mode.mjs";

const { OutlineOverlayFilter } = foundry.canvas.rendering.filters;

/**
 * Relevant wiki pages:
 * - [Scent Seeing](https://wiki.teriock.com/index.php/Ability:Scent_Seeing)
 */
export default class DetectionModeScentPerception extends BaseDetectionMode {
  /** @inheritDoc */
  static getDetectionFilter() {
    return (this._detectionFilter ??= OutlineOverlayFilter.create({
      outlineColor: [0.5, 0.5, 0, 1],
      knockout: true,
      wave: true,
    }));
  }

  /** @inheritDoc */
  get isScent() {
    return true;
  }
}
