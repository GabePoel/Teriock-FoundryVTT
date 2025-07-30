const { DetectionMode } = foundry.canvas.perception;
const { Token } = foundry.canvas.placeables;

/**
 * This exists to override the default light perception mode. This handles non-token detection (doors, etc.), but token
 * detection is covered by {@link DetectionModeMaterialMaterial}. However, if the {@link TeriockActor} is Ethereal,
 * then they cannot interact with material objects.
 *
 * Relevant wiki pages:
 * - [Ethereal](https://wiki.teriock.com/index.php/Condition:Ethereal)
 */
export default class DetectionModeLightPerception extends DetectionMode {
  /**
   * @inheritDoc
   * @param {PointVisionSource} visionSource
   * @param {object|null} visionSource.object
   * @param {TeriockToken} visionSource.object.document
   * @param {object|null} target
   * @param {TeriockToken} target.document
   */
  _canDetect(visionSource, target) {
    return !(
      target instanceof Token ||
      visionSource.object.document.hasStatusEffect("ethereal") ||
      visionSource.object.document.hasStatusEffect("blind")
    );
  }

  /** @inheritDoc */
  _testPoint(visionSource, mode, target, test) {
    if (!super._testPoint(visionSource, mode, target, test)) return false;
    return canvas.effects.testInsideLight(test.point);
  }
}
