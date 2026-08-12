import { TeriockCard } from "../_module.mjs";
import { BaseCardsSystem } from "../../data/systems/cards/_module.mjs";

declare module "./card.mjs" {
  export default interface TeriockCard {
    _id: ID<TeriockCard>;
    system: BaseCardsSystem;
    type: Teriock.Documents.CardType;

    get documentName(): "Card";

    get id(): ID<TeriockCard>;

    get uuid(): UUID<TeriockCard>;
  }
}

declare global {
  export interface CardTypeMap {
    stone: TeriockCard;
  }
}

export {};
