const { fields } = foundry.data;

/**
 * Actor data model mixin that handles display.
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, ActorInformationPart & Teriock.Models.ActorInformationPartData>}
 */
export default function ActorInformationPart(Base) {
  /**
   * @implements {Teriock.Models.ActorInformationPartData}
   * @mixin
   * @property {TeriockActor} parent
   */
  class ActorInformationPart extends Base {
    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), { notes: new fields.HTMLField() });
    }
  }

  return ActorInformationPart;
}
