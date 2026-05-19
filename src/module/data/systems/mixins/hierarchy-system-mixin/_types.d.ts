declare global {
  namespace Teriock.Models {
    export type HierarchySystemData = {
      /** <schema> UUID of a document that this is dependent on. */
      _dep: ID<AnyChildDocument> | UUID<AnyChildDocument>;
      /** <base> UUID of this document. Created during `toObject()`. */
      _ref: UUID<AnyCommonDocument>;
      /** <schema> UUID of the document that is this ones' sup. */
      _sup: UUID<AnyCommonDocument>;
    };
  }
}

export {};
