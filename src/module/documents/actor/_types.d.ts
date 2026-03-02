import { TeriockActiveEffect, TeriockTokenDocument } from "../_module.mjs";
import { BaseActorSystem } from "../../data/systems/actors/_module.mjs";
import { BaseActorSheet } from "../../applications/sheets/actor-sheets/_module.mjs";
import { DocumentCollection } from "../../../../foundry/client/documents/abstract/_module.mjs";

declare global {
  namespace Teriock.Documents {
    export interface ActorInterface {
      _id: ID<GenericActor>;
      effects: DocumentCollection<GenericActiveEffect>;
      items: DocumentCollection<GenericItem>;
      sheet: BaseActorSheet;
      statuses: Set<Teriock.Parameters.Condition.ConditionKey>;
      system: BaseActorSystem;

      get actor(): GenericActor;

      get appliedEffects(): GenericActiveEffect[];

      get documentName(): "Actor";

      getDependentTokens(): TeriockTokenDocument[];

      get id(): ID<GenericActor>;

      get itemTypes(): Teriock.Parent.ParentItemTypes;

      get temporaryEffects(): TeriockActiveEffect[];

      get token(): TeriockTokenDocument | null;

      get uuid(): UUID<GenericActor>;
    }
  }
}

export {};
