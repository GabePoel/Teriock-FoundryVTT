const { DetectionMode } = foundry.canvas.perception;
const { Token } = foundry.canvas.placeables;

export default class TeriockDetectionMode extends DetectionMode {
  static BLOCKING_SRC_STATUS_EFFECTS = [
    "blind",
    "down",
    "frozen",
    "asleep",
    "unconscious",
    "dead",
  ];
  static BLOCKING_TGT_STATUS_EFFECTS = ["invisible", "hidden"];

  /**
   * Can this PointVisionSource theoretically detect a certain object based on its properties?
   * This check should not consider the relative positions of either object, only their state.
   *
   * @param {PointVisionSource} visionSource
   * @param {object|null} visionSource.object
   * @param {TeriockToken} visionSource.object.document
   * @param {object|null} target
   * @param {TeriockToken} target.document
   * @override
   */
  _canDetect(visionSource, target) {
    const src = visionSource.object.document;
    for (const effect of this.constructor.BLOCKING_SRC_STATUS_EFFECTS) {
      if (src.hasStatusEffect(effect)) {
        return false;
      }
    }

    if (target instanceof Token) {
      const tgt = target.document;
      for (const effect of this.constructor.BLOCKING_TGT_STATUS_EFFECTS) {
        if (tgt.hasStatusEffect(effect)) {
          return false;
        }
      }
    }

    return true;
  }
}
