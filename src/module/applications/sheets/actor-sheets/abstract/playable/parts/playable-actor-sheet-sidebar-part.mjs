/**
 * @template {MixinBase} T
 * @param {T} Base
 */
export default function PlayableActorSheetSidebarPart(Base) {
  /** @mixin */
  class PlayableActorSheetSidebarPart extends Base {
    /** @inheritDoc */
    async _prepareContext(options = {}) {
      return Object.assign(await super._prepareContext(options), {
        environment: this.document.type === "environment",
        takeStatButtons: true,
      });
    }
  }

  return PlayableActorSheetSidebarPart;
}
