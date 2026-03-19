declare global {
  namespace Teriock.Models {
    export type HierarchySystemData = {
      _ref: UUID<CommonDocument>;
      _sup: UUID<CommonDocument>;
    };
  }
}

export {};
