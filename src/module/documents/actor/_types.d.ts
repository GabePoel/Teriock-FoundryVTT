import { DocumentCollection } from "@client/documents/abstract/_module.mjs";

import { TeriockActiveEffect, TeriockTokenDocument } from "../_module.mjs";
import { BaseActorSheet } from "../../applications/sheets/actor-sheets/_module.mjs";
import { BaseActorSystem } from "../../data/systems/actors/_module.mjs";

declare global {
  namespace Teriock.Documents {
    export interface ActorInterface {
      _id: ID<AnyActor>;
      // @ts-expect-error DocumentConstructionContext
      effects: DocumentCollection<AnyActiveEffect>;
      // @ts-expect-error DocumentConstructionContext
      items: DocumentCollection<AnyItem>;
      sheet: BaseActorSheet;
      statuses: Set<Teriock.Keys.Condition>;
      system: BaseActorSystem;

      get actor(): AnyActor;

      get appliedEffects(): AnyActiveEffect[];

      get documentName(): "Actor";

      getDependentTokens(): TeriockTokenDocument[];

      get id(): ID<AnyActor>;

      get temporaryEffects(): TeriockActiveEffect[];

      get token(): TeriockTokenDocument | null;

      get uuid(): UUID<AnyActor>;
    }
  }
}

export {};
