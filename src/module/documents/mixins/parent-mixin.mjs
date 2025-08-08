import { toCamelCase } from "../../helpers/utils.mjs";

/**
 * Builds effect types and keys from a document's valid effects.
 *
 * @param {ParentDocument} document - The document to build effect types for.
 * @returns {BuiltEffectTypes} Each {@link TeriockEffect} this contains, keyed by type, in multiple formats.
 */
function _buildEffectTypes(document) {
  /** @type ParentEffectTypes */
  const effectTypes = {};
  /** @type ParentEffectKeys */
  const effectKeys = {};
  const effects = document.validEffects;
  for (const effect of effects) {
    const type = effect.type;
    if (!effectTypes[type]) effectTypes[type] = [];
    if (!effectKeys[type]) effectKeys[type] = new Set();
    effectTypes[type].push(effect);
    effectKeys[type].add(toCamelCase(effect.name));
  }
  return { effectTypes, effectKeys };
}

/**
 * Mixin for common functions used across document classes that embed children.
 *
 * @param {CommonDocument} Base
 * @mixin
 */
export default (Base) => {
  return class ParentDocument extends Base {
    /**
     * Gets the list of {@link TeriockEffect} documents associated with this document.
     * Helper method for `prepareDerivedData()` that can be called explicitly.
     *
     * @returns {TeriockEffect[]}
     */
    get validEffects() {
      return [];
    }

    /** @returns {TeriockAbility[]} */
    get abilities() {
      return this.effectTypes?.ability || [];
    }

    /** @returns {TeriockAttunement[]} */
    get attunements() {
      return this.effectTypes?.attunement || [];
    }

    /** @returns {TeriockCondition[]} */
    get conditions() {
      return this.effectTypes?.condition || [];
    }

    /** @returns {TeriockConsequence[]} */
    get consequences() {
      return this.effectTypes?.consequence || [];
    }

    /** @returns {TeriockFluency[]} */
    get fluencies() {
      return this.effectTypes?.fluency || [];
    }

    /** @returns {TeriockProperty[]} */
    get properties() {
      return this.effectTypes?.property || [];
    }

    /** @returns {TeriockResource[]} */
    get resources() {
      return this.effectTypes?.resource || [];
    }

    /**
     * Gets the list of all {@link TeriockEffect} documents that apply to this document.
     * This includes those that are not currently active.
     *
     * @returns {BuiltEffectTypes}
     */
    buildEffectTypes() {
      return _buildEffectTypes(this);
    }

    /** @inheritDoc */
    prepareDerivedData() {
      super.prepareDerivedData();
      const { effectTypes, effectKeys } = this.buildEffectTypes();
      this.effectTypes = effectTypes;
      this.effectKeys = effectKeys;
    }
  };
};
