const { DoorControl } = foundry.canvas.containers;

/**
 * @extends {DoorControl}
 * @inheritDoc
 */
export default class TeriockDoorControl extends DoorControl {
  /**
   * Whether this door control is considered Ethereal.
   * @returns {boolean}
   */
  get isEthereal() {
    return this.wall?.document?.isEthereal;
  }

  /** @inheritDoc */
  get isVisible() {
    if (this.isEthereal && !game.canvas.lighting.isEtherealVisible) { return false; }
    return super.isVisible;
  }
}
