import { TeriockCard as CardClass, TeriockCards } from "../_module.mjs";
import { BaseCardSystem } from "../../data/systems/cards/_module.mjs";

declare module "./card.mjs" {
  export default interface TeriockCard {
    _id: Readonly<ID<TeriockCard>>;
    system: BaseCardSystem;
    type: CardType;

    readonly parent: TeriockCards;
    get documentName(): "Card";
    get id(): ID<TeriockCard>;
    get uuid(): UUID<TeriockCard>;
  }
}

declare global {
  export type TeriockCard<T extends CardType = CardType> = CardClass & Subtype<CardSystemMap, T>;
}

export {};
