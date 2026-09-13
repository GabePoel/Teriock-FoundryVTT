/**
 * Mixes a base class with any number of mixins.
 * @template {AnyConstructor} TBase
 * @template {Array<(base: any) => AnyConstructor>} TMixins
 * @param {TBase} Base - The class to be extended.
 * @param {TMixins} Mixins - The mixin functions to apply.
 * @returns {ApplyMixins<TBase, TMixins>} The combined class.
 */
export function mixClasses(Base, ...Mixins) {
  return Mixins.reduce((cls, mixin) => mixin(cls), Base);
}

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
