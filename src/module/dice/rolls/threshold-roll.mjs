import BaseRoll from "./base-roll.mjs";

/** @inheritDoc */
export default class ThresholdRoll extends BaseRoll {
  /**
   * @inheritDoc
   * @param {PointerEvent} event
   * @returns {Teriock.Interaction.ThresholdOptions}
   */
  static parseEvent(event) {
    return {
      edge: Number(event.altKey ?? false) - Number(event.shiftKey ?? false),
    };
  }
}
