import * as detection from "./detection-modes/_module.mjs";
import BaseDetectionMode from "./detection-modes/base-detection-mode.mjs";
import * as vision from "./vision-modes/_module.mjs";

/**
 * Detection modes
 *
 * @type {Record<string, BaseDetectionMode>}
 */
export const detectionModes = {
  /** Overwrite default basic sight */
  basicSight: new detection.BaseDetectionMode({
    angle: false,
    id: "basicSight",
    label: "TERIOCK.PERCEPTION.DetectionModes.basicSight",
    type: BaseDetectionMode.DETECTION_TYPES.MOVE,
  }),
  /** Blind fighting detection mode */
  blindFighting: new detection.BlindFightingDetectionMode({
    angle: false,
    id: "blindFighting",
    label: "TERIOCK.PERCEPTION.DetectionModes.blindFighting",
    type: BaseDetectionMode.DETECTION_TYPES.MOVE,
  }),
  /** Dark vision detection mode */
  darkVision: new detection.BaseDetectionMode({
    angle: false,
    id: "darkVision",
    label: "TERIOCK.PERCEPTION.DetectionModes.darkVision",
    type: BaseDetectionMode.DETECTION_TYPES.SIGHT,
  }),
  /** Light perception detection mode */
  lightPerception: new detection.LightDetectionMode({
    angle: false,
    id: "lightPerception",
    label: "TERIOCK.PERCEPTION.DetectionModes.lightPerception",
    type: BaseDetectionMode.DETECTION_TYPES.SIGHT,
  }),
  /** Night vision detection mode */
  nightVision: new detection.BaseDetectionMode({
    angle: false,
    id: "nightVision",
    label: "TERIOCK.PERCEPTION.DetectionModes.nightVision",
    type: BaseDetectionMode.DETECTION_TYPES.SIGHT,
    walls: false,
  }),
  /** Scent perception detection mode */
  scentPerception: new detection.ScentDetectionMode({
    angle: false,
    id: "scentPerception",
    label: "TERIOCK.PERCEPTION.DetectionModes.scentPerception",
    material: false,
    type: BaseDetectionMode.DETECTION_TYPES.OTHER,
  }),
  /** Ethereal detection mode */
  seeEthereal: new detection.EtherealDetectionMode({
    angle: false,
    ethereal: true,
    id: "seeEthereal",
    label: "TERIOCK.PERCEPTION.DetectionModes.seeEthereal",
    type: BaseDetectionMode.DETECTION_TYPES.SIGHT,
  }),
  /** Invisible perception detection mode */
  seeInvisible: new detection.InvisibleDetectionMode({
    angle: false,
    id: "seeInvisible",
    label: "TERIOCK.PERCEPTION.DetectionModes.seeInvisible",
    type: BaseDetectionMode.DETECTION_TYPES.SIGHT,
  }),
  /** Sound perception detection mode */
  soundPerception: new detection.SoundDetectionMode({
    angle: false,
    id: "soundPerception",
    label: "TERIOCK.PERCEPTION.DetectionModes.soundPerception",
    material: false,
    type: BaseDetectionMode.DETECTION_TYPES.SOUND,
  }),
  /** Spectral (Ethereal lighting) detection mode */
  spectral: new detection.SpectralDetectionMode({
    angle: true,
    ethereal: true,
    id: "spectral",
    label: "TERIOCK.PERCEPTION.DetectionModes.spectral",
    type: BaseDetectionMode.DETECTION_TYPES.SIGHT,
  }),
  /** True sight detection mode */
  trueSight: new detection.TrueSightDetectionMode({
    angle: false,
    ethereal: true,
    id: "trueSight",
    label: "TERIOCK.PERCEPTION.DetectionModes.trueSight",
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
