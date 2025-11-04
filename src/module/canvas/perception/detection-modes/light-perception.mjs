import BaseDetectionMode from "./base-detection-mode.mjs";

export default class DetectionModeLightPerception extends BaseDetectionMode {
  /** @inheritDoc */
  _testPoint(visionSource, mode, target, test) {
    if (!super._testPoint(visionSource, mode, target, test)) {
      return false;
    }
    return game.canvas.effects.testInsideLight(test.point);
  }
}
