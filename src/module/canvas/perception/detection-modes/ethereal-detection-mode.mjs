import { EtherealFilter } from "../../rendering/filters/_module.mjs";
import EtherealTargetDetectionMixin from "./ethereal-target-detection-mixin.mjs";
import LightDetectionMode from "./light-detection-mode.mjs";

/**
 * Material creatures seeing Ethereal creatures.
 *
 * Relevant wiki pages:
 * - [Cat Sense](https://wiki.teriock.com/index.php/Ability:Cat_Sense)
 * - [Ethereal Senses](https://wiki.teriock.com/index.php/Ability:Ethereal_Senses)
 * - [Spirit Guide](https://wiki.teriock.com/index.php/Ability:Spirit_Guide)
 */
export default class EtherealDetectionMode extends EtherealTargetDetectionMixin(LightDetectionMode) {
  /** @inheritDoc */
  static getDetectionFilter() {
    if (!game.modules.get("tokenmagic")?.active || !game.settings.get("teriock", "actor")?.autoMagic) {
      return (this._detectionFilter ??= EtherealFilter.create({ blur: 10 }));
    }
    return super.getDetectionFilter();
  }
}
