import EtherealFilter from "../../rendering/ethereal-filter.mjs";
import LightDetectionMode from "./light-detection-mode.mjs";

const { Token } = foundry.canvas.placeables;

/**
 * Material creatures seeing Ethereal creatures.
 *
 * Relevant wiki pages:
 * - [Cat Sense](https://wiki.teriock.com/index.php/Ability:Cat_Sense)
 * - [Ethereal Senses](https://wiki.teriock.com/index.php/Ability:Ethereal_Senses)
 * - [Spirit Guide](https://wiki.teriock.com/index.php/Ability:Spirit_Guide)
 */
export default class EtherealDetectionMode extends LightDetectionMode {
  /** @inheritDoc */
  static getDetectionFilter() {
    if (!game.modules.get("tokenmagic")?.active || !game.teriock.getSetting("autoTokenMagicConditionEffects"))
      return (this._detectionFilter ??= EtherealFilter.create({ blur: 10 }));
    else return super.getDetectionFilter();
  }

  _canDetect(visionSource, target) {
    if (!super._canDetect(visionSource, target)) return false;

    if (target instanceof Token) {
      if (!target.document.hasStatusEffect("ethereal")) return false;
    }
    return true;
  }
}
