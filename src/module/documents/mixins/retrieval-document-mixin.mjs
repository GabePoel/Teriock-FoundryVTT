/**
 * Document mixin to support retrieving other documents.
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, RetrievalDocument>}
 * @todo Migrate all uses of these to chilren/previewed.
 */
export default function RetrievalDocumentMixin(Base) {
  /** @mixin */
  class RetrievalDocument extends Base {
    /**
     * Child abilities.
     * @returns {TeriockActiveEffect<"ability">[]}
     */
    get abilities() {
      return this.previewed?.documentsByType.ability ?? [];
    }

    /**
     * Child archetypes.
     * @returns {TeriockItem<"archetype">[]}
     */
    get archetypes() {
      return this.previewed?.documentsByType.archetype ?? [];
    }

    /**
     * Child attunements.
     * @returns {TeriockActiveEffect<"attunement">[]}
     */
    get attunements() {
      return this.previewed?.documentsByType.attunement ?? [];
    }

    /**
     * Child body parts.
     * @returns {TeriockItem<"body">[]}
     */
    get bodyParts() {
      return this.previewed?.documentsByType.body ?? [];
    }

    /**
     * Child conditions.
     * @returns {TeriockActiveEffect<"condition">[]}
     */
    get conditions() {
      return this.previewed?.documentsByType.condition ?? [];
    }

    /**
     * Child consequences.
     * @returns {TeriockActiveEffect<"consequence">[]}
     */
    get consequences() {
      return this.previewed?.documentsByType.consequence ?? [];
    }

    /**
     * Child equipment.
     * @returns {TeriockItem<"equipment">[]}
     */
    get equipment() {
      return this.previewed?.documentsByType.equipment ?? [];
    }

    /**
     * Child fluencies.
     * @returns {TeriockActiveEffect<"fluency">[]}
     */
    get fluencies() {
      return this.previewed?.documentsByType.fluency ?? [];
    }

    /**
     * Child imbuements.
     * @returns {TeriockActiveEffect<"imbuement">[]}
     */
    get imbuements() {
      return this.previewed?.documentsByType.imbuement ?? [];
    }

    /**
     * Child mounds.
     * @returns {TeriockItem<"mount">[]}
     */
    get mounts() {
      return this.previewed?.documentsByType.mount ?? [];
    }

    /**
     * Child powers.
     * @returns {TeriockItem<"power">[]}
     */
    get powers() {
      return this.previewed?.documentsByType.power ?? [];
    }

    /**
     * Child properties.
     * @returns {TeriockActiveEffect<"property">[]}
     */
    get properties() {
      return this.previewed?.documentsByType.property ?? [];
    }

    /**
     * Child ranks.
     * @returns {TeriockItem<"rank">[]}
     */
    get ranks() {
      return this.previewed?.documentsByType.rank ?? [];
    }

    /**
     * Child resources.
     * @returns {TeriockActiveEffect<"resource">[]}
     */
    get resources() {
      return this.previewed?.documentsByType.resource ?? [];
    }

    /**
     * Child species.
     * @returns {TeriockItem<"species">[]}
     */
    get species() {
      return this.previewed?.documentsByType.species ?? [];
    }
  }

  return RetrievalDocument;
}
