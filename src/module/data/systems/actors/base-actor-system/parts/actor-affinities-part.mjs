import { toId } from "../../../../../utils/_module.mjs";

/**
 * @import { BaseAffinity } from "../../../../pseudo-documents/affinities/abstract/_module.mjs";
 * @import AbstractActorSystem from "../abstract-actor-system.mjs";
 */

/**
 * Cache of the Affinity types that are "no effect" protections in the [FanWar](https://fanwar.com) context.
 * @type {AffinityType[]}
 */
const PROTECTION_TYPES = Object.entries(TERIOCK.CONFIG.affinity.types).filter(([, t]) => t.protection).map(([k]) => k);

/**
 * Actor data model that handles affinities.
 * @template {MixinBase<typeof AbstractActorSystem>} T
 * @param {T} Base
 */
export default function ActorAffinitiesPart(Base) {
  /**
   * @mixin
   * @property {TeriockActor} parent
   */
  class ActorAffinitiesPart extends Base {
    /**
     * Add a virtual affinity.
     * @param {AffinityType} type
     * @param {Teriock.Keys.Category} category
     * @param {string} value
     * @param {string} source
     * @param {object} data
     */
    _addVirtualAffinity(type, category, value, source, data) {
      const id = toId(`${type}${category}${value}${source}`, { hash: true });
      const keyed = category === "other" ? { name: value } : { identifier: value };
      const Affinity = TERIOCK.CONFIG.Affinity.dataModels[type];
      const affinity = new Affinity({ _id: id, category, type, ...keyed, ...data }, { parent: this });
      affinity.sourceName = source;
      this.affinities.set(affinity.id, affinity);
    }

    /**
     * Checks if there's some protection against something. Only affinities that stop or lessen something count.
     *
     * Relevant wiki pages:
     * - [Protection keywords](https://wiki.teriock.com/index.php/Category:Protection_keywords)
     *
     * @param {TypedIdentifier} identifier - What to check for protection against
     * @returns {boolean} Whether or not there's some protection against the identifier
     */
    isProtected(identifier) {
      return PROTECTION_TYPES.flatMap(type => this.affinities.getTypeSync(type, { active: true, isPassive: true }))
        .some(a => a.targetIdentifier === identifier);
    }

    /** @inheritDoc */
    prepareVirtualEffects() {
      super.prepareVirtualEffects();
      for (const { category, status, type, value } of TERIOCK.CONFIG.affinity.conditions) {
        if (!this.parent.statuses.has(status)) { continue; }
        const condition = TERIOCK.STATUSES.conditions[status];
        this._addVirtualAffinity(type, category, category === "other" ? _loc(value) : value, condition?.name, {
          img: condition?.img,
        });
      }
    }
  }

  return ActorAffinitiesPart;
}
