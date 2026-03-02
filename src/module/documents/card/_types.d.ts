import { TeriockCard, TeriockCards } from "../_module.mjs";
import { BaseCardSystem } from "../../data/systems/cards/_module.mjs";

declare global {
  namespace Teriock.Documents {
    export interface CardInterface {
      _id: ID<TeriockCard>;
      parent: TeriockCards;
      system: BaseCardSystem;
      type: Teriock.Documents.CardType;

      get documentName(): "Card";

      get id(): ID<TeriockCard>;

      get uuid(): UUID<TeriockCard>;
    }
  }
}

export {};
