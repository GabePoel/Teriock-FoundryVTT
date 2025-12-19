declare global {
  namespace Teriock.Models {
    export interface TeriockCharacterModelInterface
      extends Teriock.Models.TeriockBaseActorModelInterface {
      get parent(): TeriockCharacter;
    }
  }
}

export {};
