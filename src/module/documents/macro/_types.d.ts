declare module "./macro.mjs" {
  export default interface TeriockMacro {
    _id: ID<TeriockMacro>;

    get documentName(): "Macro";

    get id(): ID<TeriockMacro>;

    get uuid(): UUID<TeriockMacro>;
  }
}

export {};
