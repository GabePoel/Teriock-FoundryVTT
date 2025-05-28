import DetectionModeEthereal from "./detection-modes/ethereal-perception.mjs";
import DetectionModeLightPerception from "./detection-modes/light-perception.mjs";

export const teriockDetectionModes = {
  lightPerception: new DetectionModeLightPerception({
    id: "lightPerception",
    label: "Light Perception",
    type: DetectionMode.DETECTION_TYPES.SIGHT,
  }),
  seeEthereal: new DetectionModeEthereal({
    id: "seeEthereal",
    label: "See Ethereal",
    type: DetectionMode.DETECTION_TYPES.SIGHT,
  }),
}