/**
 * A generic constructor type.
 * @typedef {new (...args: any[]) => any} Constructor
 */

/**
 * Mixes a base class with any number of mixins.
 * @param {Constructor} Base - The class to be extended.
 * @param {...function(Constructor): Constructor} Mixins - The mixin functions to apply.
 * @returns {Constructor} The combined class.
 */
export function mix(Base, ...Mixins) {
  return Mixins.reduce((cls, mixin) => mixin(cls), Base);
}
