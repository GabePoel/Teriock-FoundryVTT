import { resolveDocuments } from "../../helpers/resolve.mjs";

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

    /**
     * Resolved child abilities.
     * @returns {Promise<TeriockActiveEffect<"ability">[]>}
     */
    async getAbilities() {
      return resolveDocuments(this.abilities);
    }

    /**
     * Resolved child archetypes.
     * @returns {Promise<TeriockItem<"archetype">[]>}
     */
    async getArchetypes() {
      return resolveDocuments(this.archetypes);
    }

    /**
     * Resolved child attunements.
     * @returns {Promise<TeriockActiveEffect<"attunement">[]>}
     */
    async getAttunements() {
      return resolveDocuments(this.attunements);
    }

    /**
     * Resolved child body parts.
     * @returns {Promise<TeriockItem<"body">[]>}
     */
    async getBodyParts() {
      return resolveDocuments(this.bodyParts);
    }

    /**
     * Resolved child conditions.
     * @returns {Promise<TeriockActiveEffect<"condition">[]>}
     */
    async getConditions() {
      return resolveDocuments(this.conditions);
    }

    /**
     * Resolved child consequences.
     * @returns {Promise<TeriockActiveEffect<"consequence">[]>}
     */
    async getConsequences() {
      return resolveDocuments(this.consequences);
    }

    /**
     * Resolved child equipment.
     * @returns {Promise<TeriockItem<"equipment">[]>}
     */
    async getEquipment() {
      return resolveDocuments(this.equipment);
    }

    /**
     * Resolved child fluencies.
     * @returns {Promise<TeriockActiveEffect<"fluency">[]>}
     */
    async getFluencies() {
      return resolveDocuments(this.fluencies);
    }

    /**
     * Resolved child abilities.
     * @returns {Promise<TeriockActiveEffect<"imbuement">[]>}
     */
    async getImbuements() {
      return resolveDocuments(this.imbuements);
    }

    /**
     * Resolved child mounts.
     * @returns {Promise<TeriockItem<"mount">[]>}
     */
    async getMounts() {
      return resolveDocuments(this.mounts);
    }

    /**
     * Resolved child powers.
     * @returns {Promise<TeriockItem<"power">[]>}
     */
    async getPowers() {
      return resolveDocuments(this.powers);
    }

    /**
     * Resolved child properties.
     * @returns {Promise<TeriockActiveEffect<"property">[]>}
     */
    async getProperties() {
      return resolveDocuments(this.properties);
    }

    /**
     * Resolved child ranks.
     * @returns {Promise<TeriockItem<"rank">[]>}
     */
    async getRanks() {
      return resolveDocuments(this.ranks);
    }

    /**
     * Resolved child resources.
     * @returns {Promise<TeriockActiveEffect<"resource">[]>}
     */
    async getResources() {
      return resolveDocuments(this.resources);
    }

    /**
     * Resolved child species.
     * @returns {Promise<TeriockItem<"species">[]>}
     */
    async getSpecies() {
      return resolveDocuments(this.species);
    }
  }

  return RetrievalDocument;
}
