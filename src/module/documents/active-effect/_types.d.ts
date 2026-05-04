import { BaseEffectSystem } from "../../data/systems/effects/_module.mjs";
import { BaseEffectSheet } from "../../applications/sheets/effect-sheets/_module.mjs";

declare global {
  namespace Teriock.Documents {
    export interface ActiveEffectInterface {
      _id: ID<AnyActiveEffect>;
      parent: AnyParent;
      sheet: BaseEffectSheet;
      system: BaseEffectSystem;
      type: Teriock.Documents.ActiveEffectType;

      get actor(): AnyActor | null;

      get documentName(): "ActiveEffect";

      get id(): ID<AnyActiveEffect>;

      get uuid(): UUID<AnyActiveEffect>;
    }
  }
}

export {};
