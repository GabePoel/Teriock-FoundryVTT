/**
 * @template {Constructor<BaseActorSheet>} T
 * @param {T} Base
 */
export default function PlayableActorSheetDocumentCreationPart(Base) {
  /**
   * @extends {BaseActorSheet}
   * @mixin
   */
  class PlayableActorSheetDocumentCreationPart extends Base {
    /** @inheritDoc */
    async _prepareContext(options) {
      const miscTypes = ["base", "condition", "cover", "hack"];
      return Object.assign(await super._prepareContext(options), {
        miscEffects: this.document.effects.filter(e => miscTypes.includes(e.type) && !e.isStatus),
      });
    }
  }

  return PlayableActorSheetDocumentCreationPart;
}
