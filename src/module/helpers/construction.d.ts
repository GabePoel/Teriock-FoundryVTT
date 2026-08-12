/* eslint-disable @typescript-eslint/no-explicit-any */

declare global {
  /** Class constructor for mixin factories. */
  type Constructor<T = object> = abstract new(...args: never[]) => T;

  /** Concrete class constructor for use in `extends`. */
  type Concrete<T = object> = new(...args: any[]) => T;

  /** Base for mixin factory parameters. */
  type AnyConstructor = abstract new(...args: any[]) => object;

  /** Constructed instances. */
  type InstanceOf<T> = T extends abstract new(...args: any[]) => infer I ? I : unknown;

  /** Mixin factory result. */
  type MixinResult<T, TClass> = Concrete<InstanceOf<T> & TClass>;

  /** Rebuilt intersection of mixin instances */
  type MixinInstances<TMixins extends Array<(base: any) => AnyConstructor>> = TMixins extends
    [infer THead, ...infer TTail extends Array<(base: any) => AnyConstructor>]
    ? (THead extends (base: any) => infer TNext ? InstanceOf<TNext> : unknown) & MixinInstances<TTail>
    : unknown;

  /** The class produced by applying a list of mixins to a base class. */
  type ApplyMixins<TBase extends AnyConstructor, TMixins extends Array<(base: any) => AnyConstructor>> =
    & Omit<TBase, "prototype">
    & Concrete<InstanceOf<TBase> & MixinInstances<TMixins>>;
}

export {};
