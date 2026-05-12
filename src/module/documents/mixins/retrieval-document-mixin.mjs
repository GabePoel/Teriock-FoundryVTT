import { resolveDocuments } from "../../helpers/resolve.mjs";

/**
 * Document mixin to support retrieving other documents.
 * @param {typeof CommonDocument} Base
 */
export default function RetrievalDocumentMixin(Base) {
  //noinspection JSValidateTypes,JSUnusedGlobalSymbols
  return (
    /**
     * @extends CommonDocument
     * @mixin
     */
    class RetrievalDocument extends Base {
      /**
       * Child abilities.
       * @returns {TeriockAbility[]}
       */
      get abilities() {
        return this._getByType("ability");
      }

      /**
       * Child archetypes.
       * @returns {TeriockArchetype[]}
       */
      get archetypes() {
        return this._getByType("archetype");
      }

      /**
       * Child attunements.
       * @returns {TeriockAttunement[]}
       */
      get attunements() {
        return this._getByType("attunement");
      }

      /**
       * Child body parts.
       * @returns {TeriockBody[]}
       */
      get bodyParts() {
        return this._getByType("body");
      }

      /**
       * Child conditions.
       * @returns {TeriockCondition[]}
       */
      get conditions() {
        return this._getByType("condition");
      }

      /**
       * Child consequences.
       * @returns {TeriockConsequence[]}
       */
      get consequences() {
        return this._getByType("consequence");
      }

      /**
       * Child equipment.
       * @returns {TeriockEquipment[]}
       */
      get equipment() {
        return this._getByType("equipment");
      }

      /**
       * Child fluencies.
       * @returns {TeriockFluency[]}
       */
      get fluencies() {
        return this._getByType("fluency");
      }

      /**
       * Child imbuements.
       * @returns {TeriockImbuement[]}
       */
      get imbuements() {
        return this._getByType("imbuement");
      }

      /**
       * Child mounds.
       * @returns {TeriockMount[]}
       */
      get mounts() {
        return this._getByType("mount");
      }

      /**
       * Child powers.
       * @returns {TeriockPower[]}
       */
      get powers() {
        return this._getByType("power");
      }

      /**
       * Child properties.
       * @returns {TeriockProperty[]}
       */
      get properties() {
        return this._getByType("property");
      }

      /**
       * Child ranks.
       * @returns {TeriockRank[]}
       */
      get ranks() {
        return this._getByType("rank");
      }

      /**
       * Child resources.
       * @returns {TeriockResource[]}
       */
      get resources() {
        return this._getByType("resource");
      }

      /**
       * Child species.
       * @returns {TeriockSpecies[]}
       */
      get species() {
        return this._getByType("species");
      }

      /**
       * Get all the visible children of a certain type. Use this instead of calling {@link visibleChildren} directly to
       * minimize the number of times full collections are looped over. This utilizes `documentsByType` to lazily
       * recompute relevant document arrays once per data preparation cycle.
       * @param {Teriock.Documents.ChildType} type
       * @returns {AnyChildDocument[]}
       */
      _getByType(type) {
        return this.visibleChildren.filter((c) => c.type === type);
      }

      /**
       * Resolved child abilities.
       * @returns {Promise<TeriockAbility[]>}
       */
      async getAbilities() {
        return resolveDocuments(this.abilities);
      }

      /**
       * Resolved child archetypes.
       * @returns {Promise<TeriockArchetype[]>}
       */
      async getArchetypes() {
        return resolveDocuments(this.archetypes);
      }

      /**
       * Resolved child attunements.
       * @returns {Promise<TeriockAttunement[]>}
       */
      async getAttunements() {
        return resolveDocuments(this.attunements);
      }

      /**
       * Resolved child body parts.
       * @returns {Promise<TeriockBody[]>}
       */
      async getBodyParts() {
        return resolveDocuments(this.bodyParts);
      }

      /**
       * Resolved child conditions.
       * @returns {Promise<TeriockCondition[]>}
       */
      async getConditions() {
        return resolveDocuments(this.conditions);
      }

      /**
       * Resolved child consequences.
       * @returns {Promise<TeriockConsequence[]>}
       */
      async getConsequences() {
        return resolveDocuments(this.consequences);
      }

      /**
       * Resolved child equipment.
       * @returns {Promise<TeriockEquipment[]>}
       */
      async getEquipment() {
        return resolveDocuments(this.equipment);
      }

      /**
       * Resolved child fluencies.
       * @returns {Promise<TeriockFluency[]>}
       */
      async getFluencies() {
        return resolveDocuments(this.fluencies);
      }

      /**
       * Resolved child abilities.
       * @returns {Promise<TeriockImbuement[]>}
       */
      async getImbuements() {
        return resolveDocuments(this.imbuements);
      }

      /**
       * Resolved child mounts.
       * @returns {Promise<TeriockMount[]>}
       */
      async getMounts() {
        return resolveDocuments(this.mounts);
      }

      /**
       * Resolved child powers.
       * @returns {Promise<TeriockPower[]>}
       */
      async getPowers() {
        return resolveDocuments(this.powers);
      }

      /**
       * Resolved child properties.
       * @returns {Promise<TeriockProperty[]>}
       */
      async getProperties() {
        return resolveDocuments(this.properties);
      }

      /**
       * Resolved child ranks.
       * @returns {Promise<TeriockRank[]>}
       */
      async getRanks() {
        return resolveDocuments(this.ranks);
      }

      /**
       * Resolved child resources.
       * @returns {Promise<TeriockResource[]>}
       */
      async getResources() {
        return resolveDocuments(this.resources);
      }

      /**
       * Resolved child species.
       * @returns {Promise<TeriockSpecies[]>}
       */
      async getSpecies() {
        return resolveDocuments(this.species);
      }
    }
  );
}
