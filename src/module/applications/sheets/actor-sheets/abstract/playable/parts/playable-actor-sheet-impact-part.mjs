/**
 * @template {Constructor<BaseActorSheet>} T
 * @param {T} Base
 */
export default function PlayableActorSheetImpactPart(Base) {
  return (
    /**
     * @extends {BaseActorSheet}
     * @mixin
     */
    class PlayableActorSheetImpactPart extends Base {
      /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
      static DEFAULT_OPTIONS = {
        actions: { takeHack: this._onTakeHack },
      };
    }
  );
}
