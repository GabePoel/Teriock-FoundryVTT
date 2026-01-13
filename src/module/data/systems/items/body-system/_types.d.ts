declare global {
  namespace Teriock.Models {
    export interface BodySystemInterface
      extends Teriock.Models.BaseItemSystemInterface {
      get parent(): TeriockBody;
    }
  }
}

export {};
