import { toCamelCase } from "../../helpers/utils.mjs";

/**
 * Builds effect types and keys from a document's valid effects.
 * @param {ParentDocumentMixin} document - The document to build effect types for.
 * @returns {BuiltEffectTypes} Each {@link TeriockEffect} this contains, keyed by type, in multiple formats.
 */
function _buildEffectTypes(document) {
  /** @type ParentEffectTypes */
  const effectTypes = {};
  /** @type ParentEffectKeys */
  const effectKeys = {};
  for (const effect of document.validEffects) {
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
 * @template {import("@common/_types.mjs").Constructor<foundry.abstract.Document>} BaseDocument
 * @implements {ParentDocumentMixinInterface}
 * @param {{new(): ChildDocumentMixin, prototype: ChildDocumentMixin}|BaseDocument} Base
 */
export default (Base) => {
  return class ParentDocumentMixin extends Base {
    /**
     * Gets the list of effects associated with this document.
     * Helper method for `prepareDerivedData()` that can be called explicitly.
     * @type {TeriockEffect[]}
     */
    get validEffects() {
      return this.effects;
    }

    /**
     * Gets the list of all effects that apply to this document, including those
     * that are not currently active.
     * @returns {BuiltEffectTypes}
     */
    buildEffectTypes() {
      return _buildEffectTypes(this);
    }

    /**
     * Prepares derived data for the document, including effect types and keys.
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
     * @returns {Promise<void>} Promise that resolves when the document is updated.
     */
    async forceUpdate() {
      await this.update({ "system.updateCounter": !this.system.updateCounter });
    }
  };
};
