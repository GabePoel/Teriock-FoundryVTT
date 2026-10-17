/**
 * Mixes a base class with any number of mixins.
 * @type {MixClasses}
 */
export const mixClasses = (Base, ...Mixins) => Mixins.reduce((cls, mixin) => mixin(cls), Base);

/**
 * Merge two metadata objects.
 * @template {Record<string, any>} T1
 * @template {Record<string, any>} T2
 * @param {T1} original
 * @param {T2} other
 * @returns {Readonly<T1 & T2>}
 */
export function mergeMetadata(original, other) {
  return Object.freeze(foundry.utils.mergeObject(original, other, { applyOperators: true, inplace: false }));
}
