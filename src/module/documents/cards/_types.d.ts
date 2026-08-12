declare module "./cards.mjs" {
  export default interface TeriockCards {
    _id: ID<TeriockCards>;

    get documentName(): "Cards";

    get id(): ID<TeriockCards>;

    get uuid(): UUID<TeriockCards>;
  }
}

export {};
