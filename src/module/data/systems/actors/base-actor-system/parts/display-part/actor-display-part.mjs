const { fields } = foundry.data;

/**
 * Actor data model mixin that handles display.
 * @param {typeof BaseActorSystem} Base
 */
export default (Base) => {
  return (
    /**
     * @extends {CommonSystem}
     * @extends {ActorDisplayPartInterface}
     * @mixin
     */
    class ActorDisplayPart extends Base {
      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          notes: new fields.HTMLField({ initial: "" }),
        });
      }

      /** @inheritDoc */
      prepareBaseData() {
        super.prepareBaseData();
        this.sheet = {};
      }
    }
  );
};
