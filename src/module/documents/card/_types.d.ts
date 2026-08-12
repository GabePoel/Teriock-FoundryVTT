import { Card } from "@client/documents/_module.mjs";

import { TeriockCard as CardClass } from "../_module.mjs";
import { BaseCardsSystem } from "../../data/systems/cards/_module.mjs";

type CardDocument = Teriock.Documents.DocumentBase<CardClass, Card>;

interface CardSubtype<T extends CardType> extends Teriock.Documents.Subtype<CardDocument, T, null, CardSystemMap[T]> {}

declare module "./card.mjs" {
  export default interface TeriockCard {
    _id: ID<TeriockCard>;
    system: BaseCardsSystem;
    type: CardType;

    get documentName(): "Card";

    get id(): ID<TeriockCard>;

    get uuid(): UUID<TeriockCard>;
  }
}

declare global {
  export type TeriockCard<T extends CardType = CardType> = T extends unknown ? CardSubtype<T> : never;
}

export {};
