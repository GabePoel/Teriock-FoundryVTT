import { TeriockCard, TeriockCards } from "../_module.mjs";
import { BaseCardsSystem } from "../../data/systems/cards/_module.mjs";

declare global {
  namespace Teriock.Documents {
    export interface CardInterface {
      _id: ID<TeriockCard>;
      parent: TeriockCards;
      system: BaseCardsSystem;
      type: Teriock.Documents.CardType;

      get documentName(): "Card";

      get id(): ID<TeriockCard>;

      get uuid(): UUID<TeriockCard>;
    }
  }
}

export {};
