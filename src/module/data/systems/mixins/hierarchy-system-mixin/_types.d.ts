declare global {
  namespace Teriock.Models {
    export type HierarchySystemInterface = {
      _ref: UUID<CommonDocument>;
      _sup: UUID<CommonDocument>;
    };
  }
}

export {};
