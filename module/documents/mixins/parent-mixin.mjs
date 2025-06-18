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

/** @import Document from "@common/abstract/document.mjs"; */

/**
 * Mixin for common functions used across document classes that embed children.
 * @template {import("@common/_types.mjs").Constructor<Document>} BaseDocument
 * @param {BaseDocument} Base
 *
 */
export const MixinParentDocument = (Base) => class MixinParentDocument extends Base {


  /**
   * Gets the list of effects associated with this document.
   * @type {TeriockEffect[]}
   */
  get validEffects() {
    return this.effects;
  }

  /** @inheritdoc */
  prepareDerivedData() {
    super.prepareDerivedData();
    const { effectTypes, effectKeys } = _buildEffectTypes(this);
    this.effectTypes = effectTypes;
    this.effectKeys = effectKeys;
  }
}