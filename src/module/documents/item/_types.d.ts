import { BaseItemSystem } from "../../data/systems/items/_module.mjs";
import { BaseItemSheet } from "../../applications/sheets/item-sheets/_module.mjs";
import { DocumentCollection } from "../../../../foundry/client/documents/abstract/_module.mjs";

declare global {
  namespace Teriock.Documents {
    export interface ItemInterface {
      _id: ID<AnyItem>;
      effects: DocumentCollection<AnyActiveEffect>;
      parent?: AnyActor;
      sheet: BaseItemSheet;
      system: BaseItemSystem;
      type: Teriock.Documents.ItemType;

      get actor(): AnyActor;

      get documentName(): "Item";

      get id(): ID<AnyItem>;

      get transferredEffects(): AnyActiveEffect[];

      get uuid(): UUID<AnyItem>;
    }
  }
}

export {};
