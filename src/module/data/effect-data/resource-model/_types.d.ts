declare global {
  namespace Teriock.Models {
    export interface TeriockResourceModelInterface
      extends Teriock.Models.TeriockBaseEffectModelInterface {
      get parent(): TeriockResource;
    }
  }
}

export {};
