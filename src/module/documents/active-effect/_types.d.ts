import { TeriockActiveEffect as ActiveEffectClass } from "../_module.mjs";
import { BaseEffectSystem } from "../../data/systems/effects/_module.mjs";

declare module "./active-effect.mjs" {
  export default interface TeriockActiveEffect {
    _id: Readonly<ID<TeriockActiveEffect>>;
    system: BaseEffectSystem;
    type: ActiveEffectType;

    readonly parent: TeriockActor | TeriockItem;
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
