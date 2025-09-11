import BaseDetectionMode from "./base-detection-mode.mjs";

const { OutlineOverlayFilter } = foundry.canvas.rendering.filters;
const { Token } = foundry.canvas.placeables;

/**
 * Relevant wiki pages:
 * - [Scent Seeing](https://wiki.teriock.com/index.php/Ability:Scent_Seeing)
 */
export default class DetectionModeScentPerception extends BaseDetectionMode {
  static BLOCKING_SRC_STATUS_EFFECTS = [
    "down",
    "frozen",
    "asleep",
    "unconscious",
    "dead",
    "anosmatic",
    "ethereal",
  ];
  static BLOCKING_TGT_STATUS_EFFECTS = [
    "odorless",
    "ethereal",
  ];

  /** @inheritDoc */
  static getDetectionFilter() {
    return (this._detectionFilter ??= OutlineOverlayFilter.create({
      outlineColor: [
        0.5,
        0.5,
        0,
        1,
      ],
      knockout: true,
      wave: true,
    }));
  }

  /** @inheritDoc */
  _canDetect(visionSource, target) {
    if (!super._canDetect(visionSource, target)) {
      return false;
    }
    const src = visionSource.object.document;
    if (target instanceof Token) {
      if (src.hasStatusEffect("anosmatic")) {
        return false;
      }
    }
    return true;
  }
}
