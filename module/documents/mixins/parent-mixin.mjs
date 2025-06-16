import { toCamelCase } from "../../helpers/utils.mjs";

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

export const MixinParentDocument = (Base) => class MixinParentDocument extends Base {
  get validEffects() {
    return this.effects;
  }

  /** @override */
  prepareDerivedData() {
    super.prepareDerivedData();
    const { effectTypes, effectKeys } = _buildEffectTypes(this);
    this.effectTypes = effectTypes;
    this.effectKeys = effectKeys;
  }
}