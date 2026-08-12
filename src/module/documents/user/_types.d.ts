declare module "./user.mjs" {
  export default interface TeriockUser {
    _id: ID<TeriockUser>;

    get character(): AnyActor | null;

    get documentName(): "User";

    get id(): ID<TeriockUser>;

    get uuid(): UUID<TeriockUser>;
  }
}

export {};
