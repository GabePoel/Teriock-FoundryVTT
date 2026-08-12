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
