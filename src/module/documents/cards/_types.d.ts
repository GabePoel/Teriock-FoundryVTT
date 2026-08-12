import { EmbeddedCollection } from "@common/abstract/_module.mjs";

declare module "./cards.mjs" {
  export default interface TeriockCards {
    _id: Readonly<ID<TeriockCards>>;
    cards: EmbeddedCollection<TeriockCard>;

    get documentName(): "Cards";
    get id(): ID<TeriockCards>;
    get uuid(): UUID<TeriockCards>;
  }
}

export {};
