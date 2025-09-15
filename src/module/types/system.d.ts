import { type abilityPseudoHooks, propertyPseudoHooks } from "../constants/system/pseudo-hooks.mjs";

declare global {
  export namespace Teriock.Parameters.Shared {
    export type AbilityPseudoHook = keyof typeof abilityPseudoHooks;
    export type PropertyPseudoHook = keyof typeof propertyPseudoHooks;
    export type PseudoHook = AbilityPseudoHook | PropertyPseudoHook;
  }
}
