import { TeriockCard } from "../_module.mjs";

declare module "./cards.mjs" {
  export default interface TeriockCards
    extends Teriock.Documents.Interface<TeriockCard> {
    _id: ID<TeriockCards>;

    get documentName(): "Cards";
    get id(): ID<TeriockCards>;
    get uuid(): UUID<TeriockCards>;
  }
}
