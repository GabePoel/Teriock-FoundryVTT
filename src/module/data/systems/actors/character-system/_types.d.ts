declare global {
  namespace Teriock.Models {
    export interface CharacterSystemInterface
      extends Teriock.Models.BaseActorSystemInterface {
      get parent(): TeriockCharacter;
    }
  }
}

export {};
