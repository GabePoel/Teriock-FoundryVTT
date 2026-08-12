declare global {
  namespace Teriock.Models {
    export type HierarchySystemData = {
      /** <schema> UUID of a document that this is dependent on. */
      _dep: ID<TeriockActiveEffect> | UUID<TeriockActiveEffect>;
      /** <base> UUID of this document. Created during `toObject()`. */
      _ref: UUID<TeriockActiveEffect | TeriockActor | TeriockItem>;
      /** <schema> UUID of the document that is this ones' sup. */
      _sup: UUID<TeriockActiveEffect | TeriockActor | TeriockItem>;
    };
  }
}

export {};
