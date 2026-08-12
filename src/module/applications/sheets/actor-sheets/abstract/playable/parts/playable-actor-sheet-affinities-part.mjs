import affinityConfig from "../../../../../../constants/config/affinity-config.mjs";

/**
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, PlayableActorSheetAffinitiesPart>}
 */
export default function PlayableActorSheetAffinitiesPart(Base) {
  /**
   * @mixin
   */
  class PlayableActorSheetAffinitiesPart extends Base {
    /**
     * Prepare affinity roll buttons context.
     * @param {object} context
     */
    _prepareAffinityButtonContext(context) {
      context.affinityButtons = Object.entries(affinityConfig.types).filter(([, type]) => type.button).map(
        ([key, type]) => {
          return { affinityType: key, img: type.img, label: type.label, tooltip: type?.button };
        },
      );
    }

    /** @inheritDoc */
    async _prepareContext(options = {}) {
      const context = await super._prepareContext(options);
      this._prepareAffinityButtonContext(context);
      return context;
    }
  }

  return PlayableActorSheetAffinitiesPart;
}
