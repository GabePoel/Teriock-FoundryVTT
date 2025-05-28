const { DetectionMode } = foundry.canvas.perception;
const { Token } = foundry.canvas.placeables;

export default class DetectionModeLightPerception extends DetectionMode {

  /** @override */
  _canDetect(visionSource, target) {
    const src = visionSource.object.document;
    if (src.hasStatusEffect('blind') || src.hasStatusEffect('down') || src.hasStatusEffect('frozen')) {
      return false;
    }

    if (target instanceof Token) {
      const tgt = target.document;
      if (tgt.hasStatusEffect('invisible') || tgt.hasStatusEffect('hidden')) {
        return false;
      }
      if (tgt.hasStatusEffect('ethereal') && !src.hasStatusEffect('ethereal')) {
        return false;
      }
    }

    return true
  }

  /** @inheritDoc */
  _testPoint(visionSource, mode, target, test) {
    if (!super._testPoint(visionSource, mode, target, test)) return false;
    return canvas.effects.testInsideLight(test.point);
  }
}