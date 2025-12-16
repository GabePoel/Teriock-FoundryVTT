const { fields } = foundry.data;

/**
 * Actor data model mixin that handles display.
 * @param {typeof TeriockBaseActorModel} Base
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {TeriockBaseActorModel}
     * @implements {ActorDisplayPartInterface}
     * @mixin
     */
    class ActorDisplayPart extends Base {
      static defineSchema() {
        const schema = super.defineSchema();
        Object.assign(schema, {
          notes: new fields.HTMLField({ initial: "" }),
        });
        return schema;
      }

      /** @inheritDoc */
      prepareBaseData() {
        super.prepareBaseData();
        this.sheet = {};
      }
    }
  );
};
