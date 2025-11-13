import {
  abilityPseudoHooks,
  propertyPseudoHooks,
} from "../constants/system/pseudo-hooks.mjs";
import { TeriockMacro } from "../documents/_module.mjs";
import { displayOptions } from "../constants/options/display-options.mjs";

declare global {
  export namespace Teriock.Parameters.Shared {
    export type AbilityPseudoHook = keyof typeof abilityPseudoHooks;
    export type PropertyPseudoHook = keyof typeof propertyPseudoHooks;
    export type PseudoHook = AbilityPseudoHook | PropertyPseudoHook;
    export type MacroHookRecord = Record<
      Teriock.SafeUUID<TeriockMacro>,
      Teriock.Parameters.Shared.PropertyPseudoHook
    >;
    export type CardDisplaySize = keyof typeof displayOptions.sizes;
  }
}
