declare global {
  namespace Teriock.Models {
    export type GrantedSystemData = {
      /** <schema> Applies even if the parent {@link TeriockEquipment} is dampened */
      applyIfDampened: boolean;
      /** <schema> Applies even if the parent {@link TeriockEquipment} is shattered */
      applyIfShattered: boolean;
      /** <schema> Applies even if the parent {@link TeriockEquipment} is unequipped */
      applyIfUnequipped: boolean;
    };
  }
}

export {};
