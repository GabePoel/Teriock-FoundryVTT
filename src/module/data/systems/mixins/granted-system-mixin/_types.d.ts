declare global {
  namespace Teriock.Models {
    export type GrantedSystemData = {
      /** <schema> Applies even if the parent equipment is dampened */
      applyIfDampened: boolean;
      /** <schema> Applies even if the parent equipment is destroyed */
      applyIfDestroyed: boolean;
      /** <schema> Applies even if the parent equipment is shattered */
      applyIfShattered: boolean;
      /** <schema> Applies even if the parent equipment is unequipped */
      applyIfUnequipped: boolean;
    };
  }
}

export {};
