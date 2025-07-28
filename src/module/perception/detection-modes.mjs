const { DetectionMode } = foundry.canvas.perception;
import DetectionModeBlindFighting from "./detection-modes/blind-fighting.mjs";
import DetectionModeEtherealEthereal from "./detection-modes/ethereal-ethereal-perception.mjs";
import DetectionModeEtherealMaterial from "./detection-modes/ethereal-material-perception.mjs";
import DetectionModeInvisiblePerception from "./detection-modes/invisible-perception.mjs";
import DetectionModeLightPerception from "./detection-modes/light-perception.mjs";
import DetectionModeMaterialEthereal from "./detection-modes/material-ethereal-perception.mjs";
import DetectionModeMaterialMaterial from "./detection-modes/material-material-perception.mjs";
import DetectionModeScentPerception from "./detection-modes/scent-perception.mjs";
import DetectionModeSoundPerception from "./detection-modes/sound-perception.mjs";
import DetectionModeTrueSightPerception from "./detection-modes/true-sight-perception.mjs";

/**
 * Custom detection modes.
 * @type {object}
 */
export const teriockDetectionModes = {
  /**
   * Light perception detection mode.
   * @type {DetectionModeLightPerception}
   */
  lightPerception: new DetectionModeLightPerception({
    id: "lightPerception",
    label: "Light Perception",
    type: DetectionMode.DETECTION_TYPES.SIGHT,
  }),
  /**
   * True sight detection mode.
   * @type {DetectionModeTrueSightPerception}
   */
  trueSight: new DetectionModeTrueSightPerception({
    id: "trueSight",
    label: "True Sight",
    type: DetectionMode.DETECTION_TYPES.SIGHT,
  }),
  /**
   * Invisible perception detection mode.
   * @type {DetectionModeInvisiblePerception}
   */
  seeInvisible: new DetectionModeInvisiblePerception({
    id: "seeInvisible",
    label: "See Invisible",
    type: DetectionMode.DETECTION_TYPES.SIGHT,
  }),
  /**
   * Scent perception detection mode.
   * @type {DetectionModeScentPerception}
   */
  scentPerception: new DetectionModeScentPerception({
    id: "scentPerception",
    label: "Scent Perception",
    type: DetectionMode.DETECTION_TYPES.OTHER,
  }),
  /**
   * Sound perception detection mode.
   * @type {DetectionModeSoundPerception}
   */
  soundPerception: new DetectionModeSoundPerception({
    id: "soundPerception",
    label: "Sound Perception",
    type: DetectionMode.DETECTION_TYPES.SOUND,
  }),
  /**
   * Blind fighting detection mode.
   * @type {DetectionModeBlindFighting}
   */
  blindFighting: new DetectionModeBlindFighting({
    id: "blindFighting",
    label: "Blind Fighting",
    type: DetectionMode.DETECTION_TYPES.MOVE,
  }),
  /**
   * In Material, seeing Material detection mode.
   * @type {DetectionModeMaterialMaterial}
   */
  materialMaterial: new DetectionModeMaterialMaterial({
    id: "materialMaterial",
    label: "In Material, See Material",
    type: DetectionMode.DETECTION_TYPES.SIGHT,
  }),
  /**
   * In Material, seeing Ethereal detection mode.
   * @type {DetectionModeMaterialEthereal}
   */
  materialEthereal: new DetectionModeMaterialEthereal({
    id: "materialEthereal",
    label: "In Material, See Ethereal",
    type: DetectionMode.DETECTION_TYPES.SIGHT,
  }),
  /**
   * In Ethereal, seeing Material detection mode.
   * @type {DetectionModeEtherealMaterial}
   */
  etherealMaterial: new DetectionModeEtherealMaterial({
    id: "etherealMaterial",
    label: "In Ethereal, See Material",
    type: DetectionMode.DETECTION_TYPES.SIGHT,
  }),
  /**
   * In Ethereal, seeing Ethereal detection mode.
   * @type {DetectionModeEtherealEthereal}
   */
  etherealEthereal: new DetectionModeEtherealEthereal({
    id: "etherealEthereal",
    label: "In Ethereal, See Ethereal",
    type: DetectionMode.DETECTION_TYPES.SIGHT,
  }),
  /**
   * Dark vision detection mode.
   * @type{DetectionModeMaterialMaterial}
   */
  darkVision: new DetectionModeMaterialMaterial({
    id: "darkVision",
    label: "Dark Vision",
    type: DetectionMode.DETECTION_TYPES.SIGHT,
  }),
  /**
   * Night vision detection mode.
   * @type{DetectionModeMaterialMaterial}
   */
  nightVision: new DetectionModeMaterialMaterial({
    id: "nightVision",
    label: "Night Vision",
    type: DetectionMode.DETECTION_TYPES.SIGHT,
  }),
};
