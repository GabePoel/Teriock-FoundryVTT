import EtherealFilter from '../filters/ethereal-filter.mjs';
const { DetectionMode } = foundry.canvas.perception;

export default class DetectionModeEthereal extends DetectionMode {
  /** @override */
  static getDetectionFilter() {
    return this._detectionFilter ??= EtherealFilter.create({
      blur: 10,
    });
  }

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
      if (!tgt.hasStatusEffect('ethereal')) {
        return false;
      }
    }

    return true;
  }
}