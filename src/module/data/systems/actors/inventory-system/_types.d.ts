declare global {
  namespace Teriock.Models {
    export interface InventorySystemData extends Teriock.Models.BaseActorSystemData {
      get parent(): TeriockInventory;
    }
  }
}

export {};
