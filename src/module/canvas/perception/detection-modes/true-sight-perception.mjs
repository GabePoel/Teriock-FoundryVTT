import InvisiblePerception from "./invisible-perception.mjs";

const { OutlineOverlayFilter } = foundry.canvas.rendering.filters;

/**
 * Relevant wiki pages:
 * - [True Sight](https://wiki.teriock.com/index.php/Ability:True_Sight)
 */
export default class DetectionModeTrueSightPerception extends InvisiblePerception {
  /** @inheritDoc */
  static getDetectionFilter() {
    return (this._detectionFilter ??= OutlineOverlayFilter.create({
      outlineColor: [1, 1, 1, 1],
      knockout: true,
    }));
  }
}
