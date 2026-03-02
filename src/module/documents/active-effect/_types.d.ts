import { BaseEffectSystem } from "../../data/systems/effects/_module.mjs";
import { BaseEffectSheet } from "../../applications/sheets/effect-sheets/_module.mjs";

declare global {
  namespace Teriock.Documents {
    export interface ActiveEffectInterface {
      _id: ID<GenericActiveEffect>;
      parent: GenericParent;
      sheet: BaseEffectSheet;
      system: BaseEffectSystem;
      type: Teriock.Documents.EffectType;

      get actor(): GenericActor;

      get documentName(): "ActiveEffect";

      get id(): ID<GenericActiveEffect>;

      get uuid(): UUID<GenericActiveEffect>;
    }
  }
}

export {};
