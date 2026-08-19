/**
 * Document mixin to support retrieving other documents.
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, RetrievalDocument>}
 */
export default function RetrievalDocumentMixin(Base) {
  /**
   * @mixin
   */
  class RetrievalDocument extends Base {
    /**
     * Child abilities.
     * @returns {TeriockActiveEffect<"ability">[]}
     */
    get abilities() {
      return this.visibleChildrenByType.ability ?? [];
    }

    /**
     * Child archetypes.
     * @returns {TeriockItem<"archetype">[]}
     */
    get archetypes() {
      return this.visibleChildrenByType.archetype ?? [];
    }

    /**
     * Child attunements.
     * @returns {TeriockActiveEffect<"attunement">[]}
     */
    get attunements() {
      return this.visibleChildrenByType.attunement ?? [];
    }

    /**
     * Child body parts.
     * @returns {TeriockItem<"body">[]}
     */
    get bodyParts() {
      return this.visibleChildrenByType.body ?? [];
    }

    /**
     * Child conditions.
     * @returns {TeriockActiveEffect<"condition">[]}
     */
    get conditions() {
      return this.visibleChildrenByType.condition ?? [];
    }

    /**
     * Child consequences.
     * @returns {TeriockActiveEffect<"consequence">[]}
     */
    get consequences() {
      return this.visibleChildrenByType.consequence ?? [];
    }

    /**
     * Child equipment.
     * @returns {TeriockItem<"equipment">[]}
     */
    get equipment() {
      return this.visibleChildrenByType.equipment ?? [];
    }

    /**
     * Child fluencies.
     * @returns {TeriockActiveEffect<"fluency">[]}
     */
    get fluencies() {
      return this.visibleChildrenByType.fluency ?? [];
    }

    /**
     * Child imbuements.
     * @returns {TeriockActiveEffect<"imbuement">[]}
     */
    get imbuements() {
      return this.visibleChildrenByType.imbuement ?? [];
    }

    /**
     * Child mounds.
     * @returns {TeriockItem<"mount">[]}
     */
    get mounts() {
      return this.visibleChildrenByType.mount ?? [];
    }

    /**
     * Child powers.
     * @returns {TeriockItem<"power">[]}
     */
    get powers() {
      return this.visibleChildrenByType.power ?? [];
    }

    /**
     * Child properties.
     * @returns {TeriockActiveEffect<"property">[]}
     */
    get properties() {
      return this.visibleChildrenByType.property ?? [];
    }

    /**
     * Child ranks.
     * @returns {TeriockItem<"rank">[]}
     */
    get ranks() {
      return this.visibleChildrenByType.rank ?? [];
    }

    /**
     * Child resources.
     * @returns {TeriockActiveEffect<"resource">[]}
     */
    get resources() {
      return this.visibleChildrenByType.resource ?? [];
    }

    /**
     * Child species.
     * @returns {TeriockItem<"species">[]}
     */
    get species() {
      return this.visibleChildrenByType.species ?? [];
    }
  }

  return RetrievalDocument;
}
