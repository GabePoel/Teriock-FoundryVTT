declare module "./macro.mjs" {
  export default interface TeriockMacro {
    _id: Readonly<ID<TeriockMacro>>;

    get documentName(): "Macro";
    get id(): ID<TeriockMacro>;
    get uuid(): UUID<TeriockMacro>;
  }
}

export {};
