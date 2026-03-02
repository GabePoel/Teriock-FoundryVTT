import { TeriockCards } from "../_module.mjs";

declare global {
  namespace Teriock.Documents {
    export interface CardsInterface {
      _id: ID<TeriockCards>;

      get documentName(): "Cards";

      get id(): ID<TeriockCards>;

      get uuid(): UUID<TeriockCards>;
    }
  }
}

export {};
