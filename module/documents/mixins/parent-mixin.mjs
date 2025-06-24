/** @import Document from "@common/abstract/document.mjs"; */
import { toCamelCase } from "../../helpers/utils.mjs";
import TeriockEffect from "../effect.mjs";

function _buildEffectTypes(document) {
  const effectTypes = {};
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
 * @template {import("@common/_types.mjs").Constructor<Document>} BaseDocument
 * @param {BaseDocument} Base
 * @returns {new (...args: any[]) => BaseDocument & {
 *   validEffects: TeriockEffect[];
 *   buildEffectTypes(): { effectTypes: any; effectKeys: any };
 *   prepareDerivedData(): void;
 *   effectTypes: any;
 *   effectKeys: any;
 * }}
 */
export const ParentDocumentMixin = (Base) =>
  class ParentDocumentMixin extends Base {
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
     * @returns {TeriockEffect[]}
     */
    buildEffectTypes() {
      return _buildEffectTypes(this);
    }

    /** @inheritdoc */
    prepareDerivedData() {
      super.prepareDerivedData();
      const { effectTypes, effectKeys } = this.buildEffectTypes();
      this.effectTypes = effectTypes;
      this.effectKeys = effectKeys;
    }

    async forceUpdate() {
      await this.update({ "system.updateCounter": !this.system.updateCounter });
    }
  };
