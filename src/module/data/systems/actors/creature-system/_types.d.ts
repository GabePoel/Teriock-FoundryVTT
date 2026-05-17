declare global {
  namespace Teriock.Models {
    export interface CreatureSystemData extends Teriock.Models.BaseActorSystemData {
      get parent(): TeriockCreature;
    }
  }
}

export {};
