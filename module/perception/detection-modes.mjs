import DetectionModeLightPerception from "./detection-modes/light-perception.mjs"
import DetectionModeMaterialMaterial from "./detection-modes/material-material-perception.mjs"
import DetectionModeMaterialEthereal from "./detection-modes/material-ethereal-perception.mjs"
import DetectionModeEtherealMaterial from "./detection-modes/ethereal-material-perception.mjs"
import DetectionModeEtherealEthereal from "./detection-modes/ethereal-ethereal-perception.mjs"

export const teriockDetectionModes = {
  lightPerception: new DetectionModeLightPerception({
    id: "lightPerception",
    label: "Light Perception",
    type: DetectionMode.DETECTION_TYPES.SIGHT,
  }),
  materialMaterial: new DetectionModeMaterialMaterial({
    id: "materialMaterial",
    label: "In Material, See Material",
    type: DetectionMode.DETECTION_TYPES.SIGHT,
  }),
  materialEthereal: new DetectionModeMaterialEthereal({
    id: "materialEthereal",
    label: "In Material, See Ethereal",
    type: DetectionMode.DETECTION_TYPES.SIGHT,
  }),
  etherealMaterial: new DetectionModeEtherealMaterial({
    id: "etherealMaterial",
    label: "In Ethereal, See Material",
    type: DetectionMode.DETECTION_TYPES.SIGHT,
  }),
  etherealEthereal: new DetectionModeEtherealEthereal({
    id: "etherealEthereal",
    label: "In Ethereal, See Ethereal",
    type: DetectionMode.DETECTION_TYPES.SIGHT,
  }),
}