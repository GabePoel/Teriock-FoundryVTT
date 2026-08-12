declare module "./user.mjs" {
  export default interface TeriockUser {
    _id: Readonly<ID<TeriockUser>>;

    get character(): TeriockActor | null;
    get documentName(): "User";
    get id(): ID<TeriockUser>;
    get uuid(): UUID<TeriockUser>;
  }
}

export {};
