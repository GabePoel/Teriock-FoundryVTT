import BaseDetectionMode from "./base-detection-mode.mjs";

const { Token } = foundry.canvas.placeables;

/**
 * Ethereal creatures seeing Ethereal creatures.
 *
 * Relevant wiki pages:
 * - [Ethereal](https://wiki.teriock.com/index.php/Condition:Ethereal)
 */
export default class DetectionModeEtherealEthereal extends BaseDetectionMode {
  /** @inheritDoc */
  _canDetect(visionSource, target) {
    if (!super._canDetect(visionSource, target)) {
      return false;
    }
    const src = visionSource.object.document;
    if (target instanceof Token) {
      const tgt = target.document;
      if (
        !(src.hasStatusEffect("ethereal") && tgt.hasStatusEffect("ethereal"))
      ) {
        return false;
      }
    }
    return true;
  }

  /**
   * Target must be illuminated with light from the material world or be within 15 feet of the source.
   * @inheritDoc
   */
  _testPoint(visionSource, mode, target, test) {
    if (!super._testPoint(visionSource, mode, target, test)) {
      return false;
    }
    const inLight = game.canvas.effects.testInsideLight(test.point);
    const point = test.point;
    const { x, y } = visionSource.data;
    const radius = visionSource.object.getLightRadius(15);
    const dx = point.x - x;
    const dy = point.y - y;
    return inLight || dx * dx + dy * dy <= radius * radius;
  }
}
