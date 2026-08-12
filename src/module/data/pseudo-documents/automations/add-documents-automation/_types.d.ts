declare module "./add-documents-automation.mjs" {
  export default interface AddDocumentsAutomation {
    attachDocuments: boolean;
    separate: boolean;
    target: Teriock.Keys.ApplicationTarget;
    children: { data: object, enabled: boolean, overrideData: boolean, uuids: Set<UUID<AnyChildDocument>>[] };
  }
}

export {};
