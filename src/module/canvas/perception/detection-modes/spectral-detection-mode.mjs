import BaseDetectionMode from "./base-detection-mode.mjs";
import EtherealTargetDetectionMixin from "./ethereal-target-detection-mixin.mjs";

export default class SpectralDetectionMode extends EtherealTargetDetectionMixin(BaseDetectionMode) {}
