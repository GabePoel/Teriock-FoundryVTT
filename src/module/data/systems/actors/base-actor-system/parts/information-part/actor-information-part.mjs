const { fields } = foundry.data;

/**
 * Actor data model mixin that handles display.
 * @template {Constructor<BaseActorSystem>} T
 * @param {T} Base
 */
export default function ActorInformationPart(Base) {
  return (
    /**
     * @extends {CommonSystem}
     * @extends {Teriock.Models.ActorInformationPartData}
     * @mixin
     * @property {AnyActor} parent
     */
    class ActorInformationPart extends Base {
      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), { notes: new fields.HTMLField({ initial: "" }) });
      }
    }
  );
}
