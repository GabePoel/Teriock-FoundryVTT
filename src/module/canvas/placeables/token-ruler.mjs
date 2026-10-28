const { TokenRuler } = foundry.canvas.placeables.tokens;

/** @inheritDoc */
export default class TeriockTokenRuler extends TokenRuler {
  /** @inheritDoc */
  static WAYPOINT_LABEL_TEMPLATE = "teriock/ui/waypoint-label";

  /**
   * Color for a waypoint based on how many times its movement cost exceeds the Actor's movement speed.
   * @param {DeepReadonly<TokenRulerWaypoint>} waypoint
   * @returns {Color|undefined}
   */
  #getMovementColor(waypoint) {
    const speed = this.token.actor?.system.movementSpeed;
    if (speed === undefined) { return; }
    const { green, orange, red, yellow } = TERIOCK.DISPLAY.colors.palette;
    const index = Math.clamp(Math.ceil(waypoint.measurement.cost / speed) - 1 || 0, 0, 3);
    return foundry.utils.Color.from([green, yellow, orange, red][index]);
  }

  /** @inheritDoc */
  _getGridHighlightStyle(waypoint, offset) {
    const style = super._getGridHighlightStyle(waypoint, offset);
    style.color = this.#getMovementColor(waypoint) ?? style.color;
    return style;
  }

  /** @inheritDoc */
  _getSegmentStyle(waypoint) {
    const style = super._getSegmentStyle(waypoint);
    style.color = this.#getMovementColor(waypoint) ?? style.color;
    return style;
  }

  /** @inheritDoc */
  _getWaypointLabelContext(waypoint, state) {
    const context = super._getWaypointLabelContext(waypoint, state);
    if (context) { context.speed = this.token.actor?.system.movementSpeed; }
    return context;
  }

  /** @inheritDoc */
  _getWaypointStyle(waypoint) {
    const style = super._getWaypointStyle(waypoint);
    style.color = this.#getMovementColor(waypoint) ?? style.color;
    return style;
  }
}
