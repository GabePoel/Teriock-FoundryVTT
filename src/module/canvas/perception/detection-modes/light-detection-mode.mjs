import BaseDetectionMode from "./base-detection-mode.mjs";

export default class LightDetectionMode extends BaseDetectionMode {
  /** @inheritDoc */
  _testPoint(visionSource, mode, target, test) {
    if (!super._testPoint(visionSource, mode, target, test)) {
      return false;
    }
    const inLight = game.canvas.effects.testInsideLight(test.point);
    if (inLight) {
      return true;
    }
    const darkVision = visionSource.object?.document.detectionModes.darkVision;
    if (darkVision?.enabled) {
      return this._testRange(visionSource, darkVision, target, test);
    }
  }
}
