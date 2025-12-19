declare global {
  namespace Teriock.Models {
    export interface TeriockCreatureModelInterface
      extends Teriock.Models.TeriockBaseActorModelInterface {
      get parent(): TeriockCreature;
    }
  }
}

export {};
