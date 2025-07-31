const { Token } = foundry.canvas.placeables;
import EtherealFilter from "../../rendering/ethereal-filter.mjs";
import BaseDetectionMode from "./base-detection-mode.mjs";

/**
 * Material creatures seeing Ethereal creatures.
 *
 * Relevant wiki pages:
 * - [Cat Sense](https://wiki.teriock.com/index.php/Ability:Cat_Sense)
 * - [Ethereal Senses](https://wiki.teriock.com/index.php/Ability:Ethereal_Senses)
 * - [Spirit Guide](https://wiki.teriock.com/index.php/Ability:Spirit_Guide)
 */
export default class DetectionModeMaterialEthereal extends BaseDetectionMode {
  /** @inheritDoc */
  static getDetectionFilter() {
    return (this._detectionFilter ??= EtherealFilter.create({
      blur: 10,
    }));
  }

  /** @inheritDoc */
  _canDetect(visionSource, target) {
    if (!super._canDetect(visionSource, target)) {
      return false;
    }
    const src = visionSource.object.document;
    if (target instanceof Token) {
      const tgt = target.document;
      if (
        !(!src.hasStatusEffect("ethereal") && tgt.hasStatusEffect("ethereal"))
      ) {
        return false;
      }
    }
    return true;
  }
}
