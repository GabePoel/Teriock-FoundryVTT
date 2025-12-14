const { fields } = foundry.data;

/**
 * Actor data model mixin that handles display.
 * @param {typeof TeriockBaseActorModel} Base
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @implements {ActorDisplayPartInterface}
     * @mixin
     */
    class ActorDisplayPart extends Base {
      static defineSchema() {
        const schema = super.defineSchema();
        Object.assign(schema, {
          sheet: new fields.SchemaField({
            display: new fields.SchemaField({
              ability: displayField("small", true),
              consequence: displayField("small", true),
              equipment: displayField("small", true),
              fluency: displayField(),
              power: displayField(),
              rank: displayField(),
              resource: displayField(),
            }),
            notes: new fields.HTMLField({ initial: "" }),
          }),
        });
        return schema;
      }
    }
  );
};

/**
 * Field for card displays.
 * @param {Teriock.Parameters.Shared.CardDisplaySize} size
 * @param {boolean} gapless
 */
function displayField(size = "medium", gapless = false) {
  return new fields.SchemaField({
    gapless: new fields.BooleanField({ initial: gapless }),
    size: new fields.StringField({ initial: size }),
  });
}
