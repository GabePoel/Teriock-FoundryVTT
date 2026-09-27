import { TeriockActiveEffect as ActiveEffectClass } from "../_module.mjs";
import { TeriockDocumentSheet } from "../../applications/api/_module.mjs";
import { BaseEffectSystem } from "../../data/systems/effects/_module.mjs";

declare module "./active-effect.mjs" {
  export default interface TeriockActiveEffect {
    _id: Readonly<ID<TeriockActiveEffect>>;
    sheet: TeriockDocumentSheet;
    system: BaseEffectSystem;
    type: ActiveEffectType;

    get documentName(): "ActiveEffect";
    get id(): ID<TeriockActiveEffect>;
    get uuid(): UUID<TeriockActiveEffect>;
  }
}

declare global {
  export type TeriockActiveEffect<T extends ActiveEffectType = ActiveEffectType> =
    & ActiveEffectClass
    & Subtype<ActiveEffectSystemMap, T>;
}

export {};
