import InvisiblePerception from "./invisible-detection-mode.mjs";

const { OutlineOverlayFilter } = foundry.canvas.rendering.filters;

/**
 * Relevant wiki pages:
 * - [True Sight](https://wiki.teriock.com/index.php/Ability:True_Sight)
 */
export default class TrueSightDetectionMode extends InvisiblePerception {
  /** @inheritDoc */
  static getDetectionFilter() {
    return (this._detectionFilter ??= OutlineOverlayFilter.create({ knockout: true, outlineColor: [1, 1, 1, 1] }));
  }
}
