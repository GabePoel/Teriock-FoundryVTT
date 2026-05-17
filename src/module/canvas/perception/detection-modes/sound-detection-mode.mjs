import BaseDetectionMode from "./base-detection-mode.mjs";

const { OutlineOverlayFilter } = foundry.canvas.rendering.filters;

/**
 * Relevant wiki pages:
 * - [Advanced Hearing](https://wiki.teriock.com/index.php/Ability:Advanced_Hearing)
 */
export default class SoundDetectionMode extends BaseDetectionMode {
  /** @inheritDoc */
  static getDetectionFilter() {
    return (this._detectionFilter ??= OutlineOverlayFilter.create({
      knockout: true,
      outlineColor: [0.5, 0.5, 0, 1],
      wave: true,
    }));
  }
}
