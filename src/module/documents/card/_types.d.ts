import { TeriockCard as CardClass } from "../_module.mjs";
import { BaseCardsSystem } from "../../data/systems/cards/_module.mjs";

declare module "./card.mjs" {
  export default interface TeriockCard {
    _id: Readonly<ID<TeriockCard>>;
    system: BaseCardsSystem;
    type: CardType;

    get documentName(): "Card";
    get id(): ID<TeriockCard>;
    get uuid(): UUID<TeriockCard>;
  }
}

declare global {
  export type TeriockCard<T extends CardType = CardType> = CardClass & Subtype<CardSystemMap, T>;
}

export {};
