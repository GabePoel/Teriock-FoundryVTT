declare global {
  namespace Teriock.Models {
    export interface CreatureSystemInterface
      extends Teriock.Models.BaseActorSystemInterface {
      get parent(): TeriockCreature;
    }
  }
}

export {};
