declare global {
  namespace Teriock.Models {
    export interface ResourceSystemInterface
      extends Teriock.Models.BaseEffectSystemInterface {
      get parent(): TeriockResource;
    }
  }
}

export {};
