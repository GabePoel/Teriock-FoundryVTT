const { Document } = foundry.abstract;
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
 * @param {DeepPartial<Document>} BaseDocument
 * @implements {ParentDocumentMixinInterface}
 * @mixin
 */
export default (BaseDocument) => {
  return class ParentDocument extends BaseDocument {
    /**
     * Gets the list of {@link TeriockEffect} documents associated with this document.
     * Helper method for `prepareDerivedData()` that can be called explicitly.
     *
     * @returns {TeriockEffect[]}
     */
    get validEffects() {
      return [];
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

    /**
     * Prepares derived data for the document, including effect types and keys.
     *
     * @inheritdoc
     */
    prepareDerivedData() {
      super.prepareDerivedData();
      const { effectTypes, effectKeys } = this.buildEffectTypes();
      this.effectTypes = effectTypes;
      this.effectKeys = effectKeys;
    }

    /**
     * Forces an update of the document by toggling the update counter.
     * This is useful for triggering reactive updates in the UI.
     *
     * @returns {Promise<void>} Promise that resolves when the document is updated.
     */
    async forceUpdate() {
      await this.update({ "system.updateCounter": !this.system.updateCounter });
    }
  };
};
