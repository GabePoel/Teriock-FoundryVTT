const { OutlineOverlayFilter } = foundry.canvas.rendering.filters;
import TeriockDetectionMode from "./teriock-detection-mode.mjs";

export default class DetectionModeDarkvision extends TeriockDetectionMode {
  static BLOCKING_SRC_STATUS_EFFECTS = ["down", "frozen", "asleep", "blind", "unconscious", "dead", "ethereal"];
  static BLOCKING_TGT_STATUS_EFFECTS = ["ethereal", "invisible", "hidden"];

  /** @override */
  _canDetect(visionSource, target) {
    if (!super._canDetect(visionSource, target)) {
      return false;
    }
    return true;
  }
}
