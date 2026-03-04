declare global {
  namespace Teriock.Models {
    export interface HierarchySystemInterface {
      _ref: UUID<CommonDocument>;
      _sup: UUID<CommonDocument>;
    }
  }
}

export {};
