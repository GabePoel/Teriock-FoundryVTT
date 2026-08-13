import { TeriockActiveEffect as ActiveEffectClass } from "../_module.mjs";
import { BaseEffectSystem } from "../../data/systems/effects/_module.mjs";

interface ActiveEffectSubtype<T extends ActiveEffectType> extends ActiveEffectClass {
  sheet: ActiveEffectSheetMap[T];
  system: ActiveEffectSystemMap[T];
  type: T;
}

declare module "./active-effect.mjs" {
  export default interface TeriockActiveEffect {
    _id: Readonly<ID<TeriockActiveEffect>>;
    system: BaseEffectSystem;
    type: ActiveEffectType;

    get documentName(): "ActiveEffect";
    get id(): ID<TeriockActiveEffect>;
    get uuid(): UUID<TeriockActiveEffect>;
  }
}

declare global {
  export type TeriockActiveEffect<T extends ActiveEffectType = ActiveEffectType> = T extends unknown
    ? ActiveEffectSubtype<T>
    : never;
}

export {};
