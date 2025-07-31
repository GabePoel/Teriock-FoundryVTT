import * as detection from "./detection-modes/_module.mjs";
import BaseDetectionMode from "./detection-modes/base-detection-mode.mjs";
import * as vision from "./vision-modes/_module.mjs";

/**
 * Detection modes
 *
 * @type {Record<string, BaseDetectionMode>}
 */
export const detectionModes = {
  /** Light perception detection mode */
  lightPerception: new detection.LightPerception({
    id: "lightPerception",
    label: "Light Perception",
    type: BaseDetectionMode.DETECTION_TYPES.SIGHT,
  }),
  /** True sight detection mode */
  trueSight: new detection.TrueSightPerception({
    id: "trueSight",
    label: "True Sight",
    type: BaseDetectionMode.DETECTION_TYPES.SIGHT,
  }),
  /** Invisible perception detection mode */
  seeInvisible: new detection.InvisiblePerception({
    id: "seeInvisible",
    label: "See Invisible",
    type: BaseDetectionMode.DETECTION_TYPES.SIGHT,
  }),
  /** Scent perception detection mode */
  scentPerception: new detection.ScentPerception({
    id: "scentPerception",
    label: "Scent Perception",
    type: BaseDetectionMode.DETECTION_TYPES.OTHER,
  }),
  /** Sound perception detection mode */
  soundPerception: new detection.SoundPerception({
    id: "soundPerception",
    label: "Sound Perception",
    type: BaseDetectionMode.DETECTION_TYPES.SOUND,
  }),
  /** Blind fighting detection mode */
  blindFighting: new detection.BlindFightingPerception({
    id: "blindFighting",
    label: "Blind Fighting",
    type: BaseDetectionMode.DETECTION_TYPES.MOVE,
  }),
  /** In Material, seeing Material detection mode */
  materialMaterial: new detection.MaterialMaterialPerception({
    id: "materialMaterial",
    label: "In Material, See Material",
    type: BaseDetectionMode.DETECTION_TYPES.SIGHT,
  }),
  /** In Material, seeing Ethereal detection mode */
  materialEthereal: new detection.MaterialEtherealPerception({
    id: "materialEthereal",
    label: "In Material, See Ethereal",
    type: BaseDetectionMode.DETECTION_TYPES.SIGHT,
  }),
  /** In Ethereal, seeing Material detection mode */
  etherealMaterial: new detection.EtherealMaterialPerception({
    id: "etherealMaterial",
    label: "In Ethereal, See Material",
    type: BaseDetectionMode.DETECTION_TYPES.SIGHT,
  }),
  /** In Ethereal, seeing Ethereal detection mode */
  etherealEthereal: new detection.EtherealEtherealPerception({
    id: "etherealEthereal",
    label: "In Ethereal, See Ethereal",
    type: BaseDetectionMode.DETECTION_TYPES.SIGHT,
  }),
  /** Dark vision detection mode */
  darkVision: new detection.DarkVisionPerception({
    id: "darkVision",
    label: "Dark Vision",
    type: BaseDetectionMode.DETECTION_TYPES.SIGHT,
  }),
  /** Night vision detection mode */
  nightVision: new detection.DarkVisionPerception({
    id: "nightVision",
    label: "Night Vision",
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
