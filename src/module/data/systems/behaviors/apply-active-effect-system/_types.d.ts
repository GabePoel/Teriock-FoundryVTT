declare module "./apply-active-effect-system.mjs" {
  export default interface ApplyActiveEffectSystem {
    /** <schema> Global identifiers of effects to apply */
    identifiers: Set<TypedIdentifier>;
  }
}

export {};
