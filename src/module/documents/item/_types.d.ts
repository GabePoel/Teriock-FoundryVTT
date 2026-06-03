import { DocumentCollection } from "@client/documents/abstract/_module.mjs";

import { BaseItemSystem } from "../../data/systems/items/_module.mjs";

declare global {
  namespace Teriock.Documents {
    export interface ItemInterface {
      _id: ID<AnyItem>;
      // @ts-expect-error Not a document
      effects: DocumentCollection<AnyActiveEffect>;
      parent?: AnyActor;
      system: BaseItemSystem;
      type: Teriock.Documents.ItemType;

      get actor(): AnyActor | null;

      get documentName(): "Item";

      get id(): ID<AnyItem>;

      get transferredEffects(): AnyActiveEffect[];

      get uuid(): UUID<AnyItem>;
    }
  }
}

export {};
