declare global {
  namespace Teriock.Models {
    export interface CharacterSystemData
      extends Teriock.Models.BaseActorSystemData {
      get parent(): TeriockCharacter;
    }
  }
}

export {};
