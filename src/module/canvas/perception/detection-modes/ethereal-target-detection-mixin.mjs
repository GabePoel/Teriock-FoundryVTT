const { Token } = foundry.canvas.placeables;

/**
 * Restrict detection to targets that are Ethereal.
 * @param {typeof BaseDetectionMode} Base
 */
export default function EtherealTargetDetectionMixin(Base) {
  return (
    /**
     * @extends {BaseDetectionMode}
     * @mixin
     */
    class EtherealTargetDetectionMode extends Base {
      /** @inheritDoc */
      _canDetect(visionSource, target) {
        if (!super._canDetect(visionSource, target)) { return false; }

        if (target instanceof Token) {
          if (!target.document.hasStatusEffect("ethereal")) { return false; }
        }
        return true;
      }
    }
  );
}
