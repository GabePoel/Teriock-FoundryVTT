const { DetectionMode } = foundry.canvas.perception;

/**
 * This exists to eliminate the default light perception mode. Everything is
 * handled by the Ethereal and Material modes.
 */
export default class DetectionModeLightPerception extends DetectionMode {
  /** @override */
  _canDetect(visionSource, target) {
    return false;
  }
}
