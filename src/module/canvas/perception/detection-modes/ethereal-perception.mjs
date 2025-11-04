import EtherealFilter from "../../rendering/ethereal-filter.mjs";
import DetectionModeLightPerception from "./light-perception.mjs";

const { Token } = foundry.canvas.placeables;

/**
 * Material creatures seeing Ethereal creatures.
 *
 * Relevant wiki pages:
 * - [Cat Sense](https://wiki.teriock.com/index.php/Ability:Cat_Sense)
 * - [Ethereal Senses](https://wiki.teriock.com/index.php/Ability:Ethereal_Senses)
 * - [Spirit Guide](https://wiki.teriock.com/index.php/Ability:Spirit_Guide)
 */
export default class DetectionModeEthereal extends DetectionModeLightPerception {
  /** @inheritDoc */
  static getDetectionFilter() {
    //noinspection JSUnresolvedReference
    if (
      !game.modules.get("tokenmagic")?.active ||
      !game.settings.get("teriock", "automaticTokenMagicConditionEffects")
    ) {
      //noinspection JSValidateTypes
      return (this._detectionFilter ??= EtherealFilter.create({
        blur: 10,
      }));
    } else {
      return super.getDetectionFilter();
    }
  }

  _canDetect(visionSource, target) {
    if (!super._canDetect(visionSource, target)) {
      return false;
    }
    if (target instanceof Token) {
      if (!target.document.hasStatusEffect("ethereal")) {
        return false;
      }
    }
    return true;
  }
}
