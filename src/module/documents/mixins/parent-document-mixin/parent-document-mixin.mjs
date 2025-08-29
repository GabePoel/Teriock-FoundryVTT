import { documentTypes } from "../../../constants/document-types.mjs";
import { toCamelCase } from "../../../helpers/utils.mjs";

/**
 * Builds effect types and keys from a document's valid effects.
 *
 * @param {ParentDocumentMixin} document - The document to build effect types for.
 * @returns {Teriock.Parent.BuiltEffectTypes} Each {@link TeriockEffect} this contains, keyed by type, in multiple
 *   formats.
 */
function _buildEffectTypes(document) {
  /** @type ParentEffectTypes */
  const effectTypes = {};
  /** @type ParentEffectKeys */
  const effectKeys = {};
  const effects = document.validEffects;
  for (const key of Object.keys(documentTypes.effects)) {
    effectKeys[key] = new Set();
    effectTypes[key] = [];
  }
  for (const effect of effects) {
    const type = effect.type;
    effectTypes[type].push(effect);
    effectKeys[type].add(toCamelCase(effect.name));
  }
  return { effectTypes, effectKeys };
}

/**
 * Mixin for common functions used across document classes that embed children.
 *
 * @param {CommonDocumentMixin} Base
 * @mixin
 */
export default (Base) => {
  return (
    /**
     * @implements {ParentDocumentMixinInterface}
     * @extends {ClientDocument}
     */
    class ParentDocumentMixin extends Base {
      /**
       * @inheritDoc
       * @returns {TeriockAbility[]}
       */
      get abilities() {
        return this.effectTypes?.ability || [];
      }

      /**
       * @inheritDoc
       * @returns {TeriockAttunement[]}
       */
      get attunements() {
        return this.effectTypes?.attunement || [];
      }

      /**
       * @inheritDoc
       * @returns {TeriockCondition[]}
       */
      get conditions() {
        return this.effectTypes?.condition || [];
      }

      /**
       * @inheritDoc
       * @returns {TeriockConsequence[]}
       */
      get consequences() {
        return this.effectTypes?.consequence || [];
      }

      /**
       * @inheritDoc
       * @returns {TeriockFluency[]}
       */
      get fluencies() {
        return this.effectTypes?.fluency || [];
      }

      /**
       * @inheritDoc
       * @returns {TeriockProperty[]}
       */
      get properties() {
        return this.effectTypes?.property || [];
      }

      /**
       * @inheritDoc
       * @returns {TeriockResource[]}
       */
      get resources() {
        return this.effectTypes?.resource || [];
      }

      /**
       * @inheritDoc
       * @returns {TeriockEffect[]}
       */
      get validEffects() {
        return [];
      }

      /** @inheritDoc */
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
    }
  );
};
