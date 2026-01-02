declare global {
  namespace Teriock.Models {
    export interface TeriockWrapperModelInterface
      extends Teriock.Models.TeriockBaseItemModelInterface {
      get parent(): TeriockWrapper;
    }
  }
}

export {};
