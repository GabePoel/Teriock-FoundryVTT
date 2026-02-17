import BaseRoll from "./base-roll.mjs";

/** @inheritDoc */
export default class ThresholdRoll extends BaseRoll {
  /**
   * @inheritDoc
   * @param {PointerEvent} event
   * @returns {Teriock.Interaction.ThresholdOptions}
   */
  static parseEvent(event) {
    const out = {};
    if (!event) return out;
    if (event.altKey || event.shiftKey) out.showDialog = false;
    out.edge =
      Number(event?.altKey || false) - Number(event?.shiftKey || false);
    return out;
  }
}
