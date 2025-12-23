import { resolveDocuments } from "../../helpers/resolve.mjs";

/**
 * Document mixin to support retrieving other documents.
 * @param {typeof TeriockCommon} Base
 */
export default function RetrievalDocumentMixin(Base) {
  //noinspection JSValidateTypes,JSUnusedGlobalSymbols
  return (
    /**
     * @extends TeriockCommon
     * @mixin
     */
    class RetrievalDocument extends Base {
      /**
       * Child abilities.
       * @returns {TeriockAbility[]}
       */
      get abilities() {
        return this.visibleChildren.filter((c) => c.type === "ability");
      }

      /**
       * Child attunements.
       * @returns {TeriockAttunement[]}
       */
      get attunements() {
        return this.visibleChildren.filter((c) => c.type === "attunement");
      }

      /**
       * Child body parts.
       * @returns {TeriockBody[]}
       */
      get bodyParts() {
        return this.visibleChildren.filter((c) => c.type === "body");
      }

      /**
       * Child conditions.
       * @returns {TeriockCondition[]}
       */
      get conditions() {
        return this.visibleChildren.filter((c) => c.type === "condition");
      }

      /**
       * Child consequences.
       * @returns {TeriockConsequence[]}
       */
      get consequences() {
        return this.visibleChildren.filter((c) => c.type === "consequence");
      }

      /**
       * Child equipment.
       * @returns {TeriockEquipment[]}
       */
      get equipment() {
        return this.visibleChildren.filter((c) => c.type === "equipment");
      }

      /**
       * Child fluencies.
       * @returns {TeriockFluency[]}
       */
      get fluencies() {
        return this.visibleChildren.filter((c) => c.type === "fluency");
      }

      /**
       * Child mounds.
       * @returns {TeriockMount[]}
       */
      get mounts() {
        return this.visibleChildren.filter((c) => c.type === "mount");
      }

      /**
       * Child powers.
       * @returns {TeriockPower[]}
       */
      get powers() {
        return this.visibleChildren.filter((c) => c.type === "power");
      }

      /**
       * Child properties.
       * @returns {TeriockProperty[]}
       */
      get properties() {
        return this.visibleChildren.filter((c) => c.type === "property");
      }

      /**
       * Child ranks.
       * @returns {TeriockRank[]}
       */
      get ranks() {
        return this.visibleChildren.filter((c) => c.type === "rank");
      }

      /**
       * Child resources.
       * @returns {TeriockResource[]}
       */
      get resources() {
        return this.visibleChildren.filter((c) => c.type === "resource");
      }

      /**
       * Child species.
       * @returns {TeriockSpecies[]}
       */
      get species() {
        return this.visibleChildren.filter((c) => c.type === "species");
      }

      /**
       * Child wrappers.
       * @returns {TeriockWrapper[]}
       */
      get wrappers() {
        return this.visibleChildren.filter((c) => c.type === "wrapper");
      }

      /**
       * Resolved child abilities.
       * @returns {Promise<TeriockAbility[]>}
       */
      async getAbilities() {
        return resolveDocuments(this.abilities);
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

      /**
       * Resolved child wrappers.
       * @returns {Promise<TeriockWrapper[]>}
       */
      async getWrappers() {
        return resolveDocuments(this.wrappers);
      }
    }
  );
}
