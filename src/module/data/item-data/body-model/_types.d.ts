declare global {
  namespace Teriock.Models {
    export interface TeriockBodyModelInterface
      extends Teriock.Models.TeriockBaseItemModelInterface {
      get parent(): TeriockBody;
    }
  }
}

export {};
