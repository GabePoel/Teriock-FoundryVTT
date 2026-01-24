declare global {
  namespace Teriock.Models {
    export interface WrapperSystemInterface
      extends Teriock.Models.BaseItemSystemInterface {
      get parent(): TeriockWrapper;
    }
  }
}

export {};
