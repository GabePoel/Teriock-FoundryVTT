/**
 * @template {Constructor<foundry.canvas.sources.BaseLightSource>} T
 * @param {T} Base
 */
export default function EtherealLightSourceMixin(Base) {
  /**
   * @extends {foundry.canvas.sources.BaseLightSource}
   * @mixin
   */
  class EtherealLightSource extends Base {
    /** @inheritDoc */
    get active() {
      return super.active && this.isOnVisiblePlane;
    }

    /** @inheritDoc */
    get hasActiveLayer() {
      return super.hasActiveLayer && this.isOnVisiblePlane;
    }

    /**
     * Whether this is visible from viewpoint's plane. Ethereal is only visible from the Ethereal.
     * @return {boolean}
     */
    get isOnVisiblePlane() {
      return !this.object?.isEthereal || game.canvas.lighting.isEtherealVisible;
    }
  }

  return EtherealLightSource;
}
