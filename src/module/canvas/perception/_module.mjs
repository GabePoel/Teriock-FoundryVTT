import * as detection from "./detection-modes/_module.mjs";
import BaseDetectionMode from "./detection-modes/base-detection-mode.mjs";
import * as vision from "./vision-modes/_module.mjs";

/**
 * Detection modes
 *
 * @type {Record<string, BaseDetectionMode>}
 */
export const detectionModes = {
  /** Blind fighting detection mode */
  blindFighting: new detection.BlindFightingPerception({
    angle: false,
    id: "blindFighting",
    label: "Blind Fighting",
    type: BaseDetectionMode.DETECTION_TYPES.MOVE,
  }),
  /** Dark vision detection mode */
  darkVision: new detection.BasePerception({
    angle: false,
    id: "darkVision",
    label: "Dark Vision",
    type: BaseDetectionMode.DETECTION_TYPES.SIGHT,
  }),
  /** Ethereal light detection mode */
  etherealLight: new detection.EtherealLightPerception({
    angle: true,
    ethereal: true,
    id: "etherealLight",
    label: "Ethereal Light",
    type: BaseDetectionMode.DETECTION_TYPES.SIGHT,
  }),
  /** Light perception detection mode */
  lightPerception: new detection.LightPerception({
    angle: false,
    id: "lightPerception",
    label: "Light Perception",
    type: BaseDetectionMode.DETECTION_TYPES.SIGHT,
  }),
  /** Night vision detection mode */
  nightVision: new detection.BasePerception({
    angle: false,
    id: "nightVision",
    label: "Night Vision",
    type: BaseDetectionMode.DETECTION_TYPES.SIGHT,
    walls: false,
  }),
  /** Scent perception detection mode */
  scentPerception: new detection.ScentPerception({
    angle: false,
    id: "scentPerception",
    label: "Scent Perception",
    material: false,
    type: BaseDetectionMode.DETECTION_TYPES.OTHER,
  }),
  /** Ethereal detection mode */
  seeEthereal: new detection.EtherealPerception({
    angle: false,
    ethereal: true,
    id: "seeEthereal",
    label: "See Ethereal",
    type: BaseDetectionMode.DETECTION_TYPES.SIGHT,
  }),
  /** Invisible perception detection mode */
  seeInvisible: new detection.InvisiblePerception({
    angle: false,
    id: "seeInvisible",
    label: "See Invisible",
    type: BaseDetectionMode.DETECTION_TYPES.SIGHT,
  }),
  /** Sound perception detection mode */
  soundPerception: new detection.SoundPerception({
    angle: false,
    id: "soundPerception",
    label: "Sound Perception",
    material: false,
    type: BaseDetectionMode.DETECTION_TYPES.SOUND,
  }),
  /** True sight detection mode */
  trueSight: new detection.TrueSightPerception({
    angle: false,
    ethereal: true,
    id: "trueSight",
    label: "True Sight",
    type: BaseDetectionMode.DETECTION_TYPES.SIGHT,
  }),
};

/**
 * Vision modes
 *
 * @type {Record<string, TeriockVisionMode>}
 */
export const visionModes = {
  /** Dead vision mode */
  dead: vision.deadVisionMode(),
  /** Down vision mode */
  down: vision.downVisionMode(),
  /** Ethereal vision mode */
  ethereal: vision.etherealVisionMode(),
  /** Invisible-Ethereal vision mode */
  invisibleEthereal: vision.invisibleEtherealVisionMode(),
};
