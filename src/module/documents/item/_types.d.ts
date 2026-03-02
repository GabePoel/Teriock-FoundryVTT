import { BaseItemSystem } from "../../data/systems/items/_module.mjs";
import { BaseItemSheet } from "../../applications/sheets/item-sheets/_module.mjs";
import { DocumentCollection } from "../../../../foundry/client/documents/abstract/_module.mjs";

declare global {
  namespace Teriock.Documents {
    export interface ItemInterface {
      _id: ID<GenericItem>;
      effects: DocumentCollection<GenericActiveEffect>;
      parent?: GenericActor;
      sheet: BaseItemSheet;
      system: BaseItemSystem;
      type: Teriock.Documents.ItemType;

      get actor(): GenericActor;

      get documentName(): "Item";

      get id(): ID<GenericItem>;

      get transferredEffects(): GenericActiveEffect[];

      get uuid(): UUID<GenericItem>;
    }
  }
}

export {};
