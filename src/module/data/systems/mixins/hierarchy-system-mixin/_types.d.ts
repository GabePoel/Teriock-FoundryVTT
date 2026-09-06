declare global {
  namespace Teriock.Models {
    export interface HierarchySystemData {
      /** <schema> UUID of the document that is this ones' sup. */
      _sup: UUID<TeriockActiveEffect | TeriockActor | TeriockItem>;
    }
  }
}

export {};
