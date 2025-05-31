const { DetectionMode } = foundry.canvas.perception;

export default class DetectionModeLightPerception extends DetectionMode {

  /** @override */
  _canDetect(visionSource, target) {
    return false;
  }

  /** @inheritDoc */
  _testPoint(visionSource, mode, target, test) {
    if (!super._testPoint(visionSource, mode, target, test)) return false;
    return canvas.effects.testInsideLight(test.point);
  }
}