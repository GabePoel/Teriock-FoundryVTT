import { documentTypes } from "../../../constants/system/document-types.mjs";

import { toCamelCase } from "../../../helpers/string.mjs";

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
  return {
    effectTypes,
    effectKeys,
  };
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

      /**
       * Remove documents that aren't valid child types from creation data.
       * @param {"Item"|"ActiveEffect"} embeddedName
       * @param {object[]} data
       */
      _filterDocumentCreationData(embeddedName, data) {
        if (embeddedName === "ActiveEffect") {
          for (let i = data.length - 1; i >= 0; i--) {
            const effectData = data[i];
            if (
              foundry.utils.hasProperty(effectData, "type") &&
              !this.metadata.childEffectTypes.includes(
                foundry.utils.getProperty(effectData, "type"),
              )
            ) {
              data.splice(i, 1);
            }
          }
        } else if (embeddedName === "Item") {
          for (let i = data.length - 1; i >= 0; i--) {
            const itemData = data[i];
            if (
              foundry.utils.hasProperty(itemData, "type") &&
              !this.metadata.childItemTypes.includes(
                foundry.utils.getProperty(itemData, "type"),
              )
            ) {
              data.splice(i, 1);
            }
          }
        }
      }

      /** @inheritDoc */
      buildEffectTypes() {
        return _buildEffectTypes(this);
      }

      /** @inheritDoc */
      getAbilities() {
        return this.abilities.filter((a) => !a.sup);
      }

      /** @inheritDoc */
      getProperties() {
        return this.properties.filter((p) => !p.sup);
      }

      /** @inheritDoc */
      prepareDerivedData() {
        super.prepareDerivedData();
        const { effectTypes, effectKeys } = this.buildEffectTypes();
        this.effectTypes = effectTypes;
        this.effectKeys = effectKeys;
      }

      /** @inheritDoc */
      prepareSpecialData() {
        this.effects.forEach((e) => {
          e.prepareSpecialData();
        });
        super.prepareSpecialData();
      }
    }
  );
};
