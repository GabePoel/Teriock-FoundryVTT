const { DetectionMode } = foundry.canvas.perception;
import DetectionModeEtherealEthereal from "./detection-modes/ethereal-ethereal-perception.mjs";
import DetectionModeEtherealMaterial from "./detection-modes/ethereal-material-perception.mjs";
import DetectionModeInvisiblePerception from "./detection-modes/invisible-perception.mjs";
import DetectionModeLightPerception from "./detection-modes/light-perception.mjs";
import DetectionModeMaterialEthereal from "./detection-modes/material-ethereal-perception.mjs";
import DetectionModeMaterialMaterial from "./detection-modes/material-material-perception.mjs";
import DetectionModeScentPerception from "./detection-modes/scent-perception.mjs";
import DetectionModeSoundPerception from "./detection-modes/sound-perception.mjs";
import DetectionModeTrueSightPerception from "./detection-modes/true-sight-perception.mjs";

export const teriockDetectionModes = {
  seeInvisible: new DetectionModeInvisiblePerception({
    id: "seeInvisible",
    label: "See Invisible",
    type: DetectionMode.DETECTION_TYPES.SIGHT,
  }),
  scentPerception: new DetectionModeScentPerception({
    id: "scentPerception",
    label: "Scent Perception",
    type: DetectionMode.DETECTION_TYPES.SIGHT,
  }),
  soundPerception: new DetectionModeSoundPerception({
    id: "soundPerception",
    label: "Sound Perception",
    type: DetectionMode.DETECTION_TYPES.SIGHT,
  }),
  trueSight: new DetectionModeTrueSightPerception({
    id: "trueSight",
    label: "True Sight",
    type: DetectionMode.DETECTION_TYPES.SIGHT,
  }),
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
};
