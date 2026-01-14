import type TeriockCards from "../cards/cards.mjs";

declare module "./card.mjs" {
  export default interface TeriockCard
    extends Teriock.Documents.Interface<Teriock.Documents.NullDocument> {
    _id: ID<TeriockCard>;

    get documentName(): "Card";
    get id(): ID<TeriockCard>;
    get parent(): TeriockCards;
    get uuid(): UUID<TeriockCard>;
  }
}
