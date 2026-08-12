import { ActiveEffect } from "@client/documents/_module.mjs";

import { TeriockActiveEffect as ActiveEffectClass } from "../_module.mjs";
import { BaseEffectSystem } from "../../data/systems/effects/_module.mjs";

type ActiveEffectDocument = Omit<Teriock.Documents.DocumentBase<ActiveEffectClass, ActiveEffect>, "documentName"> & {
  parent: TeriockActor | TeriockItem;

  get documentName(): "ActiveEffect";
};

interface ActiveEffectSubtype<T extends ActiveEffectType>
  extends Teriock.Documents.Subtype<ActiveEffectDocument, T, ActiveEffectSheetMap[T], ActiveEffectSystemMap[T]>
{}

declare module "./active-effect.mjs" {
  export default interface TeriockActiveEffect {
    _id: Readonly<ID<TeriockActiveEffect>>;
    system: BaseEffectSystem;
    type: ActiveEffectType;

    get actor(): TeriockActor | null;
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
