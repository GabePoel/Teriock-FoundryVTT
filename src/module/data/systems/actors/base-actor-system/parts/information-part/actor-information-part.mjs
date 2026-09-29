/**
 * @import AbstractActorSystem from "../../abstract-actor-system.mjs";
 */

const { fields } = foundry.data;

/**
 * Actor data model mixin that handles display.
 * @template {MixinBase<typeof AbstractActorSystem>} T
 * @param {T} Base
 */
export default function ActorInformationPart(Base) {
  /**
   * @mixin
   * @implements {Teriock.Models.ActorInformationPartData}
   * @property {TeriockActor} parent
   */
  class ActorInformationPart
    extends /** @type {InitializedDataModel<T, Teriock.Models.ActorInformationPartData>} */ (Base)
  {
    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), { notes: new fields.HTMLField() });
    }
  }

  return ActorInformationPart;
}
