import BaseDetectionMode from "./base-detection-mode.mjs";

const { OutlineOverlayFilter } = foundry.canvas.rendering.filters;

/**
 * Relevant wiki pages:
 * - [Advanced Hearing](https://wiki.teriock.com/index.php/Ability:Advanced_Hearing)
 */
export default class DetectionModeSoundPerception extends BaseDetectionMode {
  /** @inheritDoc */
  static getDetectionFilter() {
    return (this._detectionFilter ??= OutlineOverlayFilter.create({
      outlineColor: [0.5, 0.5, 0, 1],
      knockout: true,
      wave: true,
    }));
  }
}
