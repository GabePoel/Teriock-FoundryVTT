import BaseDetectionMode from "./base-detection-mode.mjs";

const { OutlineOverlayFilter } = foundry.canvas.rendering.filters;

/**
 * Relevant wiki pages:
 * - [Scent Seeing](https://wiki.teriock.com/index.php/Ability:Scent_Seeing)
 */
export default class ScentDetectionMode extends BaseDetectionMode {
  /** @inheritDoc */
  static getDetectionFilter() {
    return (this._detectionFilter ??= OutlineOverlayFilter.create({
      knockout: true,
      outlineColor: [0.5, 0.5, 0, 1],
      wave: true,
    }));
  }

  /** @inheritDoc */
  get isScent() {
    return true;
  }
}
