/**
 * @param {typeof BaseActorSheet} Base
 */
export default function DocumentCreationActorSheetPart(Base) {
  return (
    /**
     * @extends {BaseActorSheet}
     * @mixin
     */
    class DocumentCreationActorSheetPart extends Base {
      /** @inheritDoc */
      async _prepareContext(options) {
        const miscTypes = ["base", "condition", "cover", "hack"];
        return Object.assign(await super._prepareContext(options), {
          miscEffects: this.document.effects.filter(e => miscTypes.includes(e.type) && !e.isStatus),
        });
      }
    }
  );
}
