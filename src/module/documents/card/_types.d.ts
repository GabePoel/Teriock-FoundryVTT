import { TeriockCard, TeriockCards } from "../_module.mjs";
import { BaseSystem } from "../../data/systems/abstract/_module.mjs";

declare global {
  namespace Teriock.Documents {
    export interface CardInterface {
      _id: ID<TeriockCard>;
      parent: TeriockCards;
      system: BaseSystem;
      type: Teriock.Documents.CardType;

      get documentName(): "Card";

      get id(): ID<TeriockCard>;

      get uuid(): UUID<TeriockCard>;
    }
  }
}

export {};
