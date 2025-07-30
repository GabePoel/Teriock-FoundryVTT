import * as detection from "./detection-modes/_module.mjs";
import TeriockDetectionMode from "./detection-modes/teriock-detection-mode.mjs";
import * as vision from "./vision-modes/_module.mjs";

/**
 * Detection modes
 *
 * @type {Record<string, TeriockDetectionMode>}
 */
export const detectionModes = {
  /**
   * Light perception detection mode.
   * @type {DetectionModeLightPerception}
   */
  lightPerception: new detection.LightPerception({
    id: "lightPerception",
    label: "Light Perception",
    type: TeriockDetectionMode.DETECTION_TYPES.SIGHT,
  }),
  /**
   * True sight detection mode.
   * @type {DetectionModeTrueSightPerception}
   */
  trueSight: new detection.TrueSightPerception({
    id: "trueSight",
    label: "True Sight",
    type: TeriockDetectionMode.DETECTION_TYPES.SIGHT,
  }),
  /**
   * Invisible perception detection mode.
   * @type {DetectionModeInvisiblePerception}
   */
  seeInvisible: new detection.InvisiblePerception({
    id: "seeInvisible",
    label: "See Invisible",
    type: TeriockDetectionMode.DETECTION_TYPES.SIGHT,
  }),
  /**
   * Scent perception detection mode.
   * @type {DetectionModeScentPerception}
   */
  scentPerception: new detection.ScentPerception({
    id: "scentPerception",
    label: "Scent Perception",
    type: TeriockDetectionMode.DETECTION_TYPES.OTHER,
  }),
  /**
   * Sound perception detection mode.
   * @type {DetectionModeSoundPerception}
   */
  soundPerception: new detection.SoundPerception({
    id: "soundPerception",
    label: "Sound Perception",
    type: TeriockDetectionMode.DETECTION_TYPES.SOUND,
  }),
  /**
   * Blind fighting detection mode.
   * @type {DetectionModeBlindFighting}
   */
  blindFighting: new detection.BlindFightingPerception({
    id: "blindFighting",
    label: "Blind Fighting",
    type: TeriockDetectionMode.DETECTION_TYPES.MOVE,
  }),
  /**
   * In Material, seeing Material detection mode.
   * @type {DetectionModeMaterialMaterial}
   */
  materialMaterial: new detection.MaterialMaterialPerception({
    id: "materialMaterial",
    label: "In Material, See Material",
    type: TeriockDetectionMode.DETECTION_TYPES.SIGHT,
  }),
  /**
   * In Material, seeing Ethereal detection mode.
   * @type {DetectionModeMaterialEthereal}
   */
  materialEthereal: new detection.MaterialEtherealPerception({
    id: "materialEthereal",
    label: "In Material, See Ethereal",
    type: TeriockDetectionMode.DETECTION_TYPES.SIGHT,
  }),
  /**
   * In Ethereal, seeing Material detection mode.
   * @type {DetectionModeEtherealMaterial}
   */
  etherealMaterial: new detection.EtherealMaterialPerception({
    id: "etherealMaterial",
    label: "In Ethereal, See Material",
    type: TeriockDetectionMode.DETECTION_TYPES.SIGHT,
  }),
  /**
   * In Ethereal, seeing Ethereal detection mode.
   * @type {DetectionModeEtherealEthereal}
   */
  etherealEthereal: new detection.EtherealEtherealPerception({
    id: "etherealEthereal",
    label: "In Ethereal, See Ethereal",
    type: TeriockDetectionMode.DETECTION_TYPES.SIGHT,
  }),
  /**
   * Dark vision detection mode.
   * @type{DetectionModeMaterialMaterial}
   */
  darkVision: new detection.MaterialMaterialPerception({
    id: "darkVision",
    label: "Dark Vision",
    type: TeriockDetectionMode.DETECTION_TYPES.SIGHT,
  }),
  /**
   * Night vision detection mode.
   * @type{DetectionModeMaterialMaterial}
   */
  nightVision: new detection.MaterialMaterialPerception({
    id: "nightVision",
    label: "Night Vision",
    type: TeriockDetectionMode.DETECTION_TYPES.SIGHT,
  }),
};

/**
 * Vision modes
 *
 * @type {Record<string, VisionMode>}
 */
export const visionModes = {
  dead: vision.deadVisionMode(),
  down: vision.downVisionMode(),
  ethereal: vision.etherealVisionMode(),
  invisibleEthereal: vision.invisibleEtherealVisionMode(),
};
