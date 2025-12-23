declare global {
  namespace Teriock.Models {
    export interface HierarchyDataMixinInterface {
      _ref: UUID<TeriockCommon>;
      _sup: UUID<TeriockCommon>;
    }
  }
}

export {};
