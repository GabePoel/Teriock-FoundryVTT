import DetectionModeDarkVision from "./dark-vision-perception.mjs";

/**
 * Material creatures seeing Material creatures.
 */
export default class DetectionModeMaterialMaterial extends DetectionModeDarkVision {
  static BLOCKING_SRC_STATUS_EFFECTS = [ "blind" ];

  /** @inheritDoc */
  _testPoint(visionSource, mode, target, test) {
    if (!super._testPoint(visionSource, mode, target, test)) {
      return false;
    }
    return canvas.effects.testInsideLight(test.point);
  }
}
