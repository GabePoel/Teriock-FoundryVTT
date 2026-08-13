declare module "./tracker.mjs" {
  export default interface Tracker {
    _id: ID<Tracker>;
    associatedDocumentUuids: Set<UUID>;
    associateActor: boolean;
    group: boolean;
    status: Teriock.Keys.Status | null;
  }
}

export {};
