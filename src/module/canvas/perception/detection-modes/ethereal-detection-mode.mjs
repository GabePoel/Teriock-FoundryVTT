import { EtherealFilter } from "../../rendering/filters/_module.mjs";
import LightDetectionMode from "./light-detection-mode.mjs";

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
    return (this._detectionFilter ??= EtherealFilter.create({ blur: 10 }));
  }
}
