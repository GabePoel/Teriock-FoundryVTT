const { OutlineOverlayFilter } = foundry.canvas.rendering.filters;
import BaseDetectionMode from "./base-detection-mode.mjs";

/**
 * Relevant wiki pages:
 * - [Blind Fighting](https://wiki.teriock.com/index.php/Ability:Blind_Fighting)
 */
export default class DetectionModeBlindFighting extends BaseDetectionMode {
  static BLOCKING_SRC_STATUS_EFFECTS = [
    "down",
    "frozen",
    "asleep",
    "unconscious",
    "dead",
    "ethereal",
  ];
  static BLOCKING_TGT_STATUS_EFFECTS = ["ethereal", "hidden"];

  /** @inheritDoc */
  static getDetectionFilter() {
    return (this._detectionFilter ??= OutlineOverlayFilter.create({
      outlineColor: [1, 0, 1, 1],
      knockout: true,
      wave: true,
    }));
  }
}
