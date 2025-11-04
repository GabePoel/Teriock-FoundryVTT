import LightPerception from "./light-perception.mjs";

/**
 * Relevant wiki pages:
 * - [See Invisible](https://wiki.teriock.com/index.php/Ability:See_Invisible)
 */
export default class DetectionModeInvisiblePerception extends LightPerception {
  /** @inheritDoc */
  static BLOCKING_STATUSES = {
    sight: {
      src: ["blind"],
      tgt: [],
    },
  };
}
