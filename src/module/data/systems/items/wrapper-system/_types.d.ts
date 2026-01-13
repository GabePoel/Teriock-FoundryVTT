declare global {
  namespace Teriock.Models {
    export interface WrapperSystem
      extends Teriock.Models.BaseItemSystemInterface {
      get parent(): TeriockWrapper;
    }
  }
}

export {};
